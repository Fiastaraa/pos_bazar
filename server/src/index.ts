import app from './app';

const PORT = process.env.PORT || 5000;

// Jalankan server lokal
app.listen(PORT, () => {
  console.log(`🚀 Bazar POS Server berjalan di: http://localhost:${PORT}`);
});
