"""Original diagrams and a reproducible source-filter audio example."""
from math import cos, exp, pi, sin
from pathlib import Path
import struct
import wave

def svg(inner, view, title, desc):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-labelledby="t d"><title id="t">{title}</title><desc id="d">{desc}</desc>{inner}</svg>'

def draw_figures(folder):
    # Project a harmonic comb through two broad, changing resonance bands.
    out = ['<rect width="620" height="326" fill="#162b24"/>']
    for t in [0, .25, .5, .75, 1]:
        y, dx = 256 - t * 115, t * 87
        out.append(f'<path d="M{42+dx} {y:.1f}h455" stroke="#355044" fill="none" stroke-dasharray="2 5"/>')
    for f in range(5):
        x = 42 + f * 455 / 4
        out.append(f'<path d="M{x:.1f} 256l87 -115" stroke="#3f5949" fill="none" stroke-dasharray="2 5"/>')
    for j in range(42, -1, -1):
        t = j/42
        base, dx = 256 - 115*t, 87*t
        points = []
        for i in range(231):
            f = 4000*i/230
            f0 = 176+30*sin(2*pi*t)
            comb = max(0,cos(2*pi*f/f0))**3
            env = (62*exp(-((f-(640+190*t))/285)**2) + 75*exp(-((f-(1620+570*t))/365)**2)
                   + 36*exp(-((f-(2950-210*t))/390)**2))
            a = env*(.29+.71*comb)*(.67+.33*sin(pi*(.12+.75*t)))
            points.append(f'{42+dx+455*i/230:.1f},{base-a:.1f}')
        shade = (j/42)
        color = 'rgb(%d,%d,%d)' % (int(186-93*shade),int(214-58*shade),int(136-41*shade))
        out.append(f'<polygon points="{" ".join(points)} {497+dx:.1f},{base:.1f} {42+dx:.1f},{base:.1f}" fill="#162b24"/>')
        out.append(f'<polyline points="{" ".join(points)}" fill="none" stroke="{color}" stroke-width="1.05"/>')
    out.extend(['<path d="M42 266h455m-455 -4v8m114 -8v8m114 -8v8m114 -8v8m113 -8v8M504 253l87 -115" stroke="#9ab0a0" fill="none"/>',
        '<g fill="#bcd0b9" font-family="monospace" font-size="11"><text x="36" y="286">0</text><text x="149" y="286">1</text><text x="263" y="286">2</text><text x="378" y="286">3</text><text x="480" y="286">4 kHz</text><text x="550" y="211" transform="rotate(-53 550 211)">TIME →</text></g>',
        '<g fill="#d6eab2" font-family="monospace" font-size="10" letter-spacing="1.2"><text x="39" y="38">HARMONIC SPECTRA</text></g>',
        '<path d="M40 49h25" stroke="#acc68b" stroke-width="2"/>'])
    (folder/"harmonic-field.svg").write_text(svg(''.join(out),'0 0 620 326','Harmonic spectra over time','Frequency increases from zero to four kilohertz across each line. Later slices recede into the plot. A harmonic series moves under drifting resonances.'))
    diagrams = {
      "capture":(["Pressure","Capsule","Preamp","ADC","PCM frames"],"pressure in Pa → membrane displacement → voltage gain → bounded samples","Capture chain"),
      "spectrum":(["Waveform","Window","DFT","Power","Mel bands"],"a frame at a time → frequency bins → weighted band energies","Feature computation"),
      "recognition":(["Frames","Encoder","Scores","Decoder","Hypothesis"],"acoustic evidence flows toward a provisional sequence of words","Recognition graph"),
      "interruption":(["Generated","Queued","Presented","Anchored"],"only confirmed presentation advances the durable narration position","Narration cursors"),
      "memory":(["Candidate","Consent","Store","Retrieve","Expire"],"carry provenance, scope and deletion keys through the record lifecycle","Memory lifecycle"),
      "inference":(["Capture","Schedule","Compute","Decode","Playout"],"measure queue time and waiting at the listener, as well as compute","Streaming trace"),
    }
    for slug,(steps,caption,title) in diagrams.items():
        n=len(steps)
        out=['<rect width="760" height="121" rx="8" fill="#eeeede"/>']
        for i, label in enumerate(steps):
            x=16+i*728/n
            width=728/n-17
            out.append(f'<rect x="{x:.0f}" y="24" width="{width:.0f}" height="40" rx="4" fill="#dbe6c8" stroke="#97ab8b"/>')
            out.append(f'<text x="{x+width/2:.1f}" y="49" text-anchor="middle" fill="#253c30" font-size="15" font-family="sans-serif">{label}</text>')
            if i<n-1: out.append(f'<path d="M{x+width+1:.0f} 44h13m-4 -4l4 4 -4 4" fill="none" stroke="#35553b"/>')
        out.append(f'<text x="16" y="96" fill="#485345" font-family="monospace" font-size="13">{caption}</text>')
        (folder/(slug+'.svg')).write_text(svg(''.join(out),'0 0 760 121',title,caption))

def generate_vowels(path):
    # An impulse train through an approximate spectral envelope, no recorded voice.
    rate = 16000
    audio = []
    for first, second in [(750, 1250), (290, 2250)]:
        for n in range(int(.65 * rate)):
            t = n/rate
            envelope = min(1, t/.03, (.65-t)/.05)
            sample = 0
            for k in range(1, 37):
                f=k*125
                weight=(.12/k + exp(-((f-first)/120)**2) + .65*exp(-((f-second)/165)**2))/2
                sample += weight * sin(2*pi*f*t)
            audio.append(envelope*sample)
        audio.extend([0]*int(.12*rate))
    scale=16000/max(abs(x) for x in audio)
    with wave.open(str(path),'wb') as wav:
        wav.setparams((1,2,rate,len(audio),'NONE','not compressed'))
        wav.writeframes(struct.pack('<%dh'%len(audio),*[round(x*scale) for x in audio]))
