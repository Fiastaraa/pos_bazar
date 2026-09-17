import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Menyiapkan data awal menu bazar...');

  // 1. Bersihkan data lama dengan urutan yang aman
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // 2. Produk Menu Bazar Fiktif (Makanan, Minuman, Merchandise)
  const products = [
    {
      name: 'Es Teh Manis Jumbo',
      price: 5000,
      costPrice: 2000,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kopi Susu Gula Aren',
      price: 18000,
      costPrice: 8000,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Lemon Tea Squash',
      price: 12000,
      costPrice: 5000,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Nasi Rice Bowl Ayam Teriyaki',
      price: 25000,
      costPrice: 14000,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Mie Pedas Juara Level 3',
      price: 20000,
      costPrice: 10000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dimsum Ayam Mentai (4 pcs)',
      price: 22000,
      costPrice: 11000,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sosis Bakar Bratwurst Jumbo',
      price: 15000,
      costPrice: 7500,
      stock: 70,
      imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kentang Goreng Saus Keju',
      price: 15000,
      costPrice: 6000,
      stock: 90,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Churros Cokelat Lumer',
      price: 18000,
      costPrice: 8000,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&auto=format&fit=crop&q=80',
    },
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }

  console.log(`✅ Sukses menambahkan ${products.length} menu bazar!`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
