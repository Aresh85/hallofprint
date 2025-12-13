import { defineType, defineField } from 'sanity';

// Defines the structure for product categories (e.g., "Leaflets", "Posters")
export const category = defineType({
  name: 'category',
  title: 'Product Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      description: 'e.g., Leaflets, Posters, Banners',
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
      description: 'A brief description of this product category.',
    }),
    defineField({
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Icon or image representing this category',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first (leave blank for default)',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Category',
      type: 'boolean',
      description: 'Show in featured categories section',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'image',
    },
  },
});

export default category;
