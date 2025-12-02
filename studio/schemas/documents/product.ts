import { defineType, defineField } from 'sanity';

// NOTE: This schema assumes you have registered the 'productOption' object 
// and will later register a 'category' document type.

// This defines the main Product document for Hall of Prints
export const product = defineType({
  name: 'product',
  title: 'Product (Print Item)',
  type: 'document',
  fields: [
    // 1. Core Identification
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),

    // 2. Pricing and E-commerce Flags
    defineField({
      name: 'basePrice',
      title: 'Base Price (Start Price)',
      type: 'number',
      description: 'The starting price for the product (before options). Set to 0 if "Quote Only".',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'isQuoteOnly',
      title: 'Request a Quote Only?',
      type: 'boolean',
      description: 'If checked, this product will use the Quote Form (Phase V) instead of the E-commerce Cart (Phase IV).',
      initialValue: false,
    }),

    // 3. Configuration Groups (Crucial for Print Shops)
    defineField({
      name: 'configurationGroups',
      title: 'Product Configuration Groups',
      type: 'array',
      description: 'Define groups of options that customers can select (e.g., Size, Paper Type, Quantity).',
      of: [
        {
          type: 'object',
          title: 'Option Group',
          fields: [
            defineField({
              name: 'groupName',
              title: 'Group Name',
              type: 'string',
              description: 'e.g., "Paper Stock", "Dimensions", "Lamination"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'choices',
              title: 'Available Choices',
              type: 'array',
              description: 'The list of choices for this group, referencing the reusable option schema.',
              of: [{ type: 'productOption' }], // References the 'productOption.ts' Canvas file
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
        },
      ],
    }),

    // 4. Media and Relationships
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true, // Allows content editors to control the crop
      },
    }),
    defineField({
        name: 'category',
        title: 'Category',
        type: 'reference',
        description: 'Link this product to a category (e.g., Leaflets, Posters).',
        to: [{ type: 'category' }], // Assuming you create a 'category.ts' schema later
    }),
  ],
});

export default product;