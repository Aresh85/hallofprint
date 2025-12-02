import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

// --- Import your custom schemas ---
import product from './schemas/documents/product';
import productOption from './schemas/objects/productOption';
import category from './schemas/documents/category'; // Assuming you'll add this later, as per the roadmap.

const projectId = 'z3bustn3'; // Replace with your actual project ID
const dataset = 'production'; 

export default defineConfig({
  name: 'default',
  title: 'Hall of Prints Studio',

  projectId: projectId,
  dataset: dataset,

  plugins: [
    structureTool(),
    visionTool(),
  ],

  // --- Register the schemas ---
  schema: {
    types: [
      // Documents
      product,
      category, // Placeholder for the category document

      // Objects
      productOption,
      // Add other reusable object types here
    ],
  },
});