"""Content, asset and recipe validation without network or extra packages."""
import contextlib
import importlib.util
import io
import json
import math
from pathlib import Path
import re
import struct
import sys
import tempfile
import unittest
import wave
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from build import CONTENT, DIST, ROOT, build, read_chapters, read_json
from html.parser import HTMLParser

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.extend(v for k,v in attrs if k=="href")

class BookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with contextlib.redirect_stdout(io.StringIO()):
            build()
        cls.curriculum=read_json(CONTENT/"curriculum.json")
        cls.chapters=read_chapters(cls.curriculum)
        cls.ids={c["id"] for c in cls.chapters}
        cls.sources={r["id"]:r for f in (CONTENT/"sources").glob("*.json") for r in read_json(f)}
        cls.labs={l["id"] for l in read_json(CONTENT/"labs.json")}

    def test_routes_and_metadata(self):
        self.assertEqual(self.ids,{r["id"] for r in self.curriculum["chapters"]})
        for c in self.chapters:
            for field in ("title","part","level","question","summary","minutes","goals"):
                self.assertTrue(c[field],(c["id"],field))
            self.assertTrue(set(c["prereqs"]+c["related"])<=self.ids)
            self.assertTrue(set(c["sources"])<=self.sources.keys())
            self.assertTrue(set(c["labs"])<=self.labs)
            self.assertGreater(len(c["html"].split()),600,c["id"])
            self.assertRegex(c["html"],r"(?i)exercise|try it|try this")
            self.assertIn("Check your reasoning",c["html"])
        for p in self.curriculum["paths"]:
            self.assertTrue(set(p["chapters"])<=self.ids)
        self.assertEqual(len(self.curriculum["deepDives"]),8)
        self.assertTrue(set(self.curriculum["deepDives"])<=self.ids)

    def test_prerequisites_have_no_cycles(self):
        graph={c["id"]:c["prereqs"] for c in self.chapters}
        def walk(node,stack):
            self.assertNotIn(node,stack)
            for child in graph[node]:
                walk(child,stack+[node])
        for id in graph: walk(id,[])

    def test_every_rendered_chapter_link(self):
        for c in self.chapters:
            p=Links();p.feed(c["html"])
            for link in p.links:
                if link.startswith("#"):
                    parts=link[1:].split("/")
                    self.assertEqual(len(parts),2,(c["id"],link))
                    kind,id=parts
                    expected={"chapter":self.ids,"source":self.sources,"lab":self.labs}
                    self.assertIn(kind,expected,(c["id"],link))
                    self.assertIn(id,expected[kind],(c["id"],link))
                else:
                    self.assertTrue(link.startswith(("https://","recipes/")),(c["id"],link))

    def test_glossary_directory_and_sources(self):
        glossary=read_json(CONTENT/"glossary.json")
        self.assertGreaterEqual(len(glossary),40)
        for row in glossary:
            self.assertIn(row["chapter"],self.ids)
            self.assertGreater(len(row["definition"]),50)
        for row in read_json(CONTENT/"directory.json"):
            self.assertIn(row["source"],self.sources)
        for row in self.sources.values():
            self.assertTrue(row["url"].startswith("https://"))
            self.assertRegex(row["reviewed"],r"^\d{4}-\d{2}-\d{2}$")
            self.assertTrue(row["note"])

    def test_audio_format_and_no_capture_or_autoplay(self):
        with wave.open(str(DIST/"media/vowels.wav")) as audio:
            self.assertEqual((audio.getnchannels(),audio.getsampwidth(),audio.getframerate()),(1,2,16000))
            self.assertEqual(audio.getnframes(),24640)
            raw=audio.readframes(audio.getnframes())
            samples=struct.unpack("<%dh"%(len(raw)//2),raw)
            self.assertLessEqual(max(abs(x) for x in samples),16001)
        code=" ".join(f.read_text() for f in (ROOT/"app").glob("*.js"))
        self.assertNotIn("getUserMedia",code)
        self.assertNotIn("autoplay",code)
        self.assertNotIn("https://",code)

    def test_build_is_reproducible(self):
        before=(DIST/"book.js").read_bytes()
        with contextlib.redirect_stdout(io.StringIO()): build()
        self.assertEqual(before,(DIST/"book.js").read_bytes())

class ASRDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec=importlib.util.spec_from_file_location("asr_adapter",ROOT/"recipes/asr_adapter.py")
        cls.recipe=importlib.util.module_from_spec(spec)
        sys.modules["asr_adapter"]=cls.recipe
        spec.loader.exec_module(cls.recipe)

    def fixtures(self,folder):
        rows=[]
        for i,(split,domain) in enumerate([("train","target"),("dev","target"),("dev","control"),("test","target"),("test","control")]):
            name=f"clip-{i}.wav"
            data=[round(2000*math.sin(2*math.pi*(200+71*i)*n/16000)) for n in range(2400)]
            with wave.open(str(folder/name),"wb") as f:
                f.setparams((1,2,16000,len(data),"NONE","not compressed"))
                f.writeframes(struct.pack("<%dh"%len(data),*data))
            rows.append(dict(id=str(i),split=split,domain=domain,speaker="p"+str(i),session="s"+str(i),wav=name,text="Example words."))
        return rows

    def manifest(self,folder,rows):
        p=folder/"data.jsonl";p.write_text("\n".join(json.dumps(r) for r in rows)+"\n")
        return p

    def test_good_split_and_rejections(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp);rows=self.fixtures(folder)
            p=self.manifest(folder,rows)
            samples=self.recipe.read_manifest(p)
            self.assertEqual(self.recipe.inventory(samples)["utterances"],5)
            rows[3]["speaker"]=rows[0]["speaker"]
            with self.assertRaisesRegex(ValueError,"crosses splits"): self.recipe.read_manifest(self.manifest(folder,rows))
            rows[3]["speaker"]="p3";rows[3]["wav"]=rows[0]["wav"]
            with self.assertRaisesRegex(ValueError,"duplicate PCM"): self.recipe.read_manifest(self.manifest(folder,rows))
            rows[3]["wav"]="../outside.wav"
            with self.assertRaisesRegex(ValueError,"inside"): self.recipe.read_manifest(self.manifest(folder,rows))

    def test_scoring(self):
        score=self.recipe.score_pairs([("one two","one"),("three","three four")])
        self.assertEqual(score["word_edits"],2)
        self.assertEqual(score["wer"],2/3)

if __name__=="__main__":
    unittest.main()
