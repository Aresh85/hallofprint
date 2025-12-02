import { defineType, defineField } from 'sanity';

// This defines a reusable object schema for a single configuration choice
// e.g., '100gsm Gloss' or 'Double Sided Printing'
export const productOption = defineType({
  title: 'Product Option Choice',
  name: 'productOption',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Option Name',
      type: 'string',
      description: 'e.g., A4 Size, 100gsm Gloss, or Spot UV Finish',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priceModifier',
      title: 'Price Modifier (Additive)',
      type: 'number',
      description: 'The amount to add or subtract from the Base Price for this option. Use 0 for no change.',
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'unit',
      title: 'Unit',
      type: 'string',
      description: 'e.g., per 100 units, fixed fee, or per side',
      initialValue: 'per unit',
    }),
  ],
});

export default productOption;