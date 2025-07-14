const { v4: uuidv4 } = require('uuid');
const schema = require('../utils/schema');

const sampleBlogs = [
  {
    id: uuidv4(),
    title: 'The Art of Terrazzo Flooring: A Timeless Classic',
    slug: 'art-of-terrazzo-flooring',
    content: `
      <h2>The History of Terrazzo</h2>
      <p>Terrazzo flooring has been a symbol of luxury and durability for centuries. Originating in Italy, this unique flooring material combines marble chips with cement or epoxy to create stunning, long-lasting surfaces.</p>
      
      <h2>Why Choose Terrazzo?</h2>
      <p>Terrazzo offers unparalleled durability, with some installations lasting over 100 years. Its seamless surface makes it perfect for high-traffic areas, while its customizable design allows for unique artistic expressions.</p>
      
      <h2>Modern Applications</h2>
      <p>Today, terrazzo is experiencing a renaissance in modern architecture. From residential homes to commercial spaces, terrazzo flooring continues to impress with its timeless beauty and practical benefits.</p>
    `,
    excerpt:
      'Discover the timeless beauty and durability of terrazzo flooring, from its Italian origins to modern applications in contemporary design.',
    author_id: '00000000-0000-0000-0000-000000000001', // You'll need to replace with actual user ID
    tags: JSON.stringify(['terrazzo', 'flooring', 'luxury', 'durability']),
    featured_image: '/NYC Lobby - Terrazzo Flooring.jpeg',
    status: 'published',
    published_at: new Date(),
    meta_title: 'The Art of Terrazzo Flooring: A Timeless Classic',
    meta_description:
      'Discover the timeless beauty and durability of terrazzo flooring, from its Italian origins to modern applications in contemporary design.',
  },
  {
    id: uuidv4(),
    title: 'Bathroom Design Trends for 2024',
    slug: 'bathroom-design-trends-2024',
    content: `
      <h2>Minimalist Elegance</h2>
      <p>2024 brings a focus on minimalist bathroom designs that emphasize clean lines, neutral colors, and functional beauty. The trend is moving away from ornate fixtures toward simple, elegant solutions.</p>
      
      <h2>Sustainable Materials</h2>
      <p>Eco-friendly materials are becoming increasingly popular in bathroom design. From recycled tiles to water-efficient fixtures, sustainability is at the forefront of modern bathroom design.</p>
      
      <h2>Smart Technology Integration</h2>
      <p>Smart mirrors, automated lighting, and touchless fixtures are transforming the modern bathroom experience, combining convenience with sophisticated design.</p>
    `,
    excerpt:
      'Explore the latest bathroom design trends for 2024, from minimalist elegance to smart technology integration.',
    author_id: '00000000-0000-0000-0000-000000000001', // You'll need to replace with actual user ID
    tags: JSON.stringify(['bathroom', 'design', 'trends', '2024']),
    featured_image: '/bathroom-fittings.jpg',
    status: 'published',
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    meta_title: 'Bathroom Design Trends for 2024',
    meta_description:
      'Explore the latest bathroom design trends for 2024, from minimalist elegance to smart technology integration.',
  },
  {
    id: uuidv4(),
    title: 'Kitchen Remodeling: Where Function Meets Style',
    slug: 'kitchen-remodeling-function-style',
    content: `
      <h2>The Heart of the Home</h2>
      <p>Kitchens have evolved from simple cooking spaces to the central hub of family life. Modern kitchen design balances functionality with aesthetic appeal, creating spaces that are both beautiful and practical.</p>
      
      <h2>Open Concept Living</h2>
      <p>The open concept kitchen continues to dominate design preferences, creating seamless transitions between cooking, dining, and living areas. This layout promotes social interaction and makes entertaining easier.</p>
      
      <h2>Smart Storage Solutions</h2>
      <p>Innovative storage solutions are essential in modern kitchens. From pull-out pantries to hidden appliance garages, smart storage keeps the kitchen organized and clutter-free.</p>
    `,
    excerpt:
      'Discover how modern kitchen design balances functionality with style, creating spaces that are both beautiful and practical.',
    author_id: '00000000-0000-0000-0000-000000000001', // You'll need to replace with actual user ID
    tags: JSON.stringify(['kitchen', 'remodeling', 'design', 'functionality']),
    featured_image: '/kitchen.jpeg',
    status: 'published',
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    meta_title: 'Kitchen Remodeling: Where Function Meets Style',
    meta_description:
      'Discover how modern kitchen design balances functionality with style, creating spaces that are both beautiful and practical.',
  },
];

async function seedBlogs() {
  try {
    console.log('Starting blog seeding...');

    // First, let's get a user ID to use as author_id
    const users = await schema.fetchData('users', { isDeleted: 0 }, { limit: 1 });

    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    const authorId = users[0].id;
    console.log(`Using author ID: ${authorId}`);

    // Update sample blogs with the actual author ID
    const blogsToInsert = sampleBlogs.map((blog) => ({
      ...blog,
      author_id: authorId,
    }));

    // Insert each blog
    for (const blog of blogsToInsert) {
      try {
        await schema.create('blogs', blog);
        console.log(`✓ Created blog: ${blog.title}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ Blog already exists: ${blog.title}`);
        } else {
          console.error(`✗ Error creating blog "${blog.title}":`, error.message);
        }
      }
    }

    console.log('Blog seeding completed!');
  } catch (error) {
    console.error('Error seeding blogs:', error);
  }
}

// Run the seeding function
seedBlogs();
