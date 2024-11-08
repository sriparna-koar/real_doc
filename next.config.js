// module.exports = {
//   reactStrictMode: true,
// }
module.exports = {
  env: {
    // NEXTAUTH_URL: 'http://localhost:3000'
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
};
