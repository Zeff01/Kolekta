import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'jzeffsomera@gmail.com' });

    if (user) {
      console.log('✓ User found:');
      console.log('  Email:', user.email);
      console.log('  Username:', user.username);
      console.log('  ID:', user._id);
    } else {
      console.log('✗ No user found with email: jzeffsomera@gmail.com');

      // List all users
      const allUsers = await User.find({}, 'email username');
      console.log('\nAll users in database:');
      allUsers.forEach((u: any) => console.log(`  - ${u.email} (${u.username})`));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
