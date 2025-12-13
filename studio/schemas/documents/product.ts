import { defineType, defineField } from 'sanity';

// Enhanced Product schema for Hall of Prints E-commerce
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
      description: 'SEO-optimized product description (150-200 words recommended)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'Brief one-liner for product cards (max 100 characters)',
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
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Additional product images',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      description: 'Primary product category',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),

    // 5. Product Classification & Discovery
    defineField({
      name: 'tags',
      title: 'Product Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Keywords for search and AI matching (e.g., marketing, events, business)',
    }),
    defineField({
      name: 'productSize',
      title: 'Product Size',
      type: 'string',
      options: {
        list: [
          { title: 'A0', value: 'a0' },
          { title: 'A1', value: 'a1' },
          { title: 'A2', value: 'a2' },
          { title: 'A3', value: 'a3' },
          { title: 'A4', value: 'a4' },
          { title: 'A5', value: 'a5' },
          { title: 'A6', value: 'a6' },
          { title: 'DL', value: 'dl' },
          { title: 'Custom', value: 'custom' },
        ],
      },
      description: 'Primary size for filtering',
    }),
    defineField({
      name: 'badges',
      title: 'Product Badges',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Popular', value: 'popular' },
          { title: 'Best Seller', value: 'bestseller' },
          { title: 'New', value: 'new' },
          { title: 'Best Value', value: 'bestvalue' },
          { title: 'Same Day Available', value: 'sameday' },
          { title: 'Next Day Available', value: 'nextday' },
        ],
      },
      description: 'Display badges on product cards (including delivery speed)',
    }),

    // 6. AI & Recommendation Attributes
    defineField({
      name: 'useCase',
      title: 'Primary Use Case',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Marketing & Promotion', value: 'marketing' },
          { title: 'Events & Exhibitions', value: 'events' },
          { title: 'Business & Corporate', value: 'business' },
          { title: 'Retail & Point of Sale', value: 'retail' },
          { title: 'Education & Training', value: 'education' },
          { title: 'Menus & Hospitality', value: 'menus' },
        ],
      },
      description: 'Helps AI recommend right products',
    }),
    defineField({
      name: 'targetIndustry',
      title: 'Target Industries',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Restaurant & Hospitality', value: 'restaurant' },
          { title: 'Real Estate', value: 'realestate' },
          { title: 'Retail & E-commerce', value: 'retail' },
          { title: 'Corporate & Professional Services', value: 'corporate' },
          { title: 'Events & Entertainment', value: 'events' },
          { title: 'Education', value: 'education' },
          { title: 'Healthcare', value: 'healthcare' },
        ],
      },
    }),

    // 7. SEO & Meta Information
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Custom page title for search engines (max 60 characters)',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Meta Description',
      type: 'text',
      description: 'Search engine description (150-160 characters recommended)',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Target keywords for SEO',
    }),

    // 8. Product Status & Sorting
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Show in featured/highlighted sections',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first (leave blank for default)',
    }),
    defineField({
      name: 'status',
      title: 'Product Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Draft', value: 'draft' },
          { title: 'Out of Stock', value: 'outofstock' },
          { title: 'Discontinued', value: 'discontinued' },
        ],
      },
      initialValue: 'active',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category.name',
      media: 'mainImage',
      price: 'basePrice',
    },
    prepare(selection) {
      const { title, subtitle, media, price } = selection;
      return {
        title: title,
        subtitle: subtitle ? `${subtitle} - From £${price}` : `From £${price}`,
        media: media,
      };
    },
  },
});

export default product;
