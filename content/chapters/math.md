{"id":"math","title":"The mathematics of a prediction","part":"Speech & models","level":"Foundation","minutes":30,"question":"How does one wrong acoustic prediction become a small change in the model's weights?","goals":["Read the shapes in a matrix product.","Compute conditional probability, cross-entropy and one gradient step.","Distinguish a model score, a likelihood and a calibrated decision."],"prereqs":["spectrum"],"related":["recognition","audio-tokens","adaptation","evaluation"],"labs":["evaluation"],"summary":"Build a tiny acoustic classifier on paper, then connect its arithmetic to attention, training and confidence.","sources":["math-linear","math-prob"]}

You have reduced a short sound to two band energies. The lower band is strong and the upper band is weak. How does a model turn those measurements into a probability of a speech event? Begin with a model small enough to compute by hand. The same operations reappear inside much larger encoders and decoders.

## Vectors are measurements with an order

Let x = (0.8, 0.2) contain two dimensionless, normalized band features. A vector stores those ordered quantities. Swapping the bands changes the input, even though its length and total remain the same. A row of weights w = (1, −1) computes the dot product `w·x = 1×0.8 − 1×0.2 = 0.6`. The sign tells us which band this row favors. Add a bias b to shift the point where the score crosses zero.

A matrix stacks several weight rows. A 3 × 2 matrix multiplied by a 2-element vector yields three scores. In a batch of N clips, X has shape N × 2 and `X Wᵀ` has shape N × 3. The superscript T transposes rows and columns. Write these shapes beside a model diagram. Trying to multiply N × 2 by 3 × 2 without transposing reveals an interface error immediately. The squared Euclidean distance between (0.8, 0.2) and (0.5, 0.5) is 0.3² + (−0.3)² = 0.18. A codebook can use that distance to choose a nearby representation. Feature scaling decides how strongly each coordinate contributes. [Linear algebra reference](#source/math-linear)

## Scores become a distribution

For two class scores z = (0.6, 0), softmax gives `p(k) = exp(z[k]) / Σj exp(z[j])`. The symbol Σ means sum over the listed indices. Here exp(0.6) ≈ 1.822 and exp(0) = 1, giving probabilities about (0.646, 0.354). They are nonnegative and sum to one. Adding the same constant to both scores leaves probabilities unchanged because it multiplies numerator and denominator by the same factor. Implementations subtract the largest score before exponentiation to avoid overflow.

A probability is always conditioned on a model and its evidence. The model output 0.646 does not prove that 64.6% of such clips in a new room have the first label. Calibration asks that empirical question on held-out data. A classifier can be confident about a door slam if its training only showed speech and quiet background.

## Condition, multiply and sum

Write `P(A | B)` for the probability of A given B. Suppose A means the speaker said “fourteen” and B means this acoustic recording. Bayes' rule says `P(A | B) = P(B | A) P(A) / P(B)`. P(A) is a prior, P(B | A) is a likelihood, and P(B) normalizes the alternatives. A strong prior for a familiar name can outweigh weak evidence for an unfamiliar one. That helps explain fluent recognition mistakes.

The chain rule writes `P(y₁,y₂ | X) = P(y₁ | X) P(y₂ | y₁,X)`. An autoregressive decoder uses label history in the second factor. A model may instead impose conditional independence and use `P(y₁ | X) P(y₂ | X)`. That assumption simplifies computation but restricts what it can express. When multiple hidden paths represent the same observed label, sum their probabilities. The [CTC chapter](#chapter/recognition) works a complete two-frame example. Logs turn products into sums and preserve ordering because logarithm increases monotonically. Tiny sequence probabilities are therefore easier to manipulate as log scores. [Probability reference](#source/math-prob)

## Learn by penalizing the observed error

Suppose the correct class is the second one. A one-hot target t = (0, 1) assigns all target mass to it. Cross-entropy is `L = −Σk t[k] ln p[k]`, which reduces to −ln(0.354) ≈ 1.039. A predicted probability of 0.9 for the true class gives loss about 0.105. A probability of 0.01 gives about 4.605. The natural logarithm yields loss in nats. Decibels use a different log base and reference convention.

A derivative measures how a small parameter change affects a quantity. For softmax plus this loss, `∂L/∂z[k] = p[k] − t[k]`. The gradient vector is approximately (0.646, −0.646). Increasing the true class score reduces the loss locally. Since each score is a dot product, its weight gradient is `(p[k] − t[k]) x`. For the first row it is (0.517, 0.129). With learning rate η = 0.1, gradient descent subtracts (0.0517, 0.0129) from that row. The second row moves the opposite way. Bias gradients are the score gradients themselves. One step makes the observed example easier, while potentially changing other examples too.

Neural networks compose many such transformations. The chain rule propagates gradients through the composition. A small learning rate can improve the training loss slowly. A large one can overshoot. Repeatedly improving the training loss can still memorize noise or forget earlier cases, which is why validation data guides model selection and test data is reserved for the selected model.

## Read an attention operation

Suppose a decoder is deciding which encoder frames matter to the next sound or text token. A query q compares with each key k using a dot product. Divide the score by √d, where d is the key width, then use softmax across positions. A weighted sum of the value vectors gives an output. In matrix form, `Attention(Q,K,V) = softmax(QKᵀ / √d)V`. With one query, five keys of width d and five values of width v, the weights have length five and the output has width v. A mask can prevent reading future positions. Restricting what the model observes is an architectural timing decision. No amount of faster computation removes a future-frame dependency.

## Try it

Recalculate the two-class example with z = (0, 0). Each probability becomes 0.5. If the second class is true, the loss is ln 2 ≈ 0.693 and the score gradient is (0.5, −0.5). Now set x = (0, 0). Weight gradients vanish because neither feature contributes, while bias gradients can still move. Run the muted control in the [adaptation recipe](#chapter/adaptation). Equal inputs force a deterministic classifier to predict the same class across a balanced dataset, yielding one-third accuracy for three classes.

## Check your reasoning

**Can a model with less training loss make more word errors?** Loss measures the probability assigned to training targets. Word error measures decoded sequences on a particular evaluation set. Data shift, calibration, beam search and tokenization can all change the relationship.

**Does a larger attention weight prove that a frame caused the prediction?** It shows how one operation weighted its values. Other layers and paths contribute too. Test a causal claim with a carefully controlled intervention, then inspect the resulting task behavior.
