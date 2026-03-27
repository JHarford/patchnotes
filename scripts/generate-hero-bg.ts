import { generateImage } from "../src/lib/gemini";

const prompt = `Create a wide, cinematic abstract background illustration of a planet seen from space, looking down at its curved horizon edge.

The planet surface is dark (#0a0a0f, #12121a) with hundreds of tiny glowing lights scattered across it — like city lights seen from orbit at night. The lights are electric indigo (#6366f1), soft lavender (#818cf8), and white-blue (#c7d2fe). Between the lights, thin luminous connection lines form a network mesh across the surface, like data routes or trade lines linking cities across a digital world.

Along the curved horizon edge of the planet, there is a brilliant glowing atmosphere band — a bright indigo/lavender arc that is intense and vivid, like a crescent halo. The atmosphere glows hot white-blue at its brightest point and fades to deep indigo further out.

Above the atmosphere is pure black empty space with a few faint stars scattered sparsely.

Style: Abstract, minimal, editorial. Dark moody space aesthetic. No text, no logos, no words, no letters. Pure visual art. The overall palette is dark with indigo/violet accent lighting. Think NASA earth-at-night imagery reimagined as abstract digital art.`;

async function main() {
  console.log("Generating hero background with Nano Banana...");
  const url = await generateImage(prompt, "16:9");
  if (url) {
    console.log("Success! Image URL:");
    console.log(url);
  } else {
    console.error("Failed to generate image");
    process.exit(1);
  }
}

main();
