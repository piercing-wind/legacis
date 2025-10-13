if (process.env.NODE_ENV === "production") {
  process.on('warning', (warning) => {
    console.warn('Node warning:', warning);
  });
}

// Optional: Also handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});