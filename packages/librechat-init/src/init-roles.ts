import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RolePermissions {
  PROMPTS?: { SHARED_GLOBAL?: boolean; USE?: boolean; CREATE?: boolean };
  AGENTS?: { SHARED_GLOBAL?: boolean; USE?: boolean; CREATE?: boolean };
  MEMORIES?: { USE?: boolean; CREATE?: boolean; UPDATE?: boolean; READ?: boolean; OPT_OUT?: boolean };
  BOOKMARKS?: { USE?: boolean };
  WEB_SEARCH?: { USE?: boolean };
  PEOPLE_PICKER?: { VIEW_USERS?: boolean; VIEW_GROUPS?: boolean; VIEW_ROLES?: boolean };
  MARKETPLACE?: { USE?: boolean };
  MCP_SERVERS?: { USE?: boolean; CREATE?: boolean; SHARE?: boolean };
  FILE_SEARCH?: { USE?: boolean };
  FILE_CITATIONS?: { USE?: boolean };
  RUN_CODE?: { USE?: boolean };
  MULTI_CONVO?: { USE?: boolean };
  TEMPORARY_CHAT?: { USE?: boolean };
}

interface RoleConfig {
  name: string;
  permissions: RolePermissions;
}

interface Config {
  roles: RoleConfig[];
}

// Configuration
const configPath = join(__dirname, '../config/roles.json');
const config: Config = JSON.parse(readFileSync(configPath, 'utf-8'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/LibreChat';
const DEFAULT_ADMINS = process.env.LIBRECHAT_DEFAULT_ADMINS || '';

// Mongoose schemas
const rolePermissionsSchema = new mongoose.Schema({
  PROMPTS: { SHARED_GLOBAL: Boolean, USE: Boolean, CREATE: Boolean },
  AGENTS: { SHARED_GLOBAL: Boolean, USE: Boolean, CREATE: Boolean },
  MEMORIES: { USE: Boolean, CREATE: Boolean, UPDATE: Boolean, READ: Boolean, OPT_OUT: Boolean },
  BOOKMARKS: { USE: Boolean },
  WEB_SEARCH: { USE: Boolean },
  PEOPLE_PICKER: { VIEW_USERS: Boolean, VIEW_GROUPS: Boolean, VIEW_ROLES: Boolean },
  MARKETPLACE: { USE: Boolean },
  MCP_SERVERS: { USE: Boolean, CREATE: Boolean, SHARE: Boolean },
  FILE_SEARCH: { USE: Boolean },
  FILE_CITATIONS: { USE: Boolean },
  RUN_CODE: { USE: Boolean },
  MULTI_CONVO: { USE: Boolean },
  TEMPORARY_CHAT: { USE: Boolean }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, uppercase: true },
  permissions: { type: rolePermissionsSchema, default: {} }
});

const Role = mongoose.model('Role', roleSchema);
interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: string;
}
const User = mongoose.model<IUser>('User', new mongoose.Schema({}, { strict: false }));

async function waitForMongoDB(maxRetries = 30, delayMs = 2000): Promise<void> {
  console.log('Waiting for MongoDB to be ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✓ Connected to MongoDB');
      return;
    } catch (error) {
      console.log(`  Attempt ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error('MongoDB not available after maximum retries');
}

export async function initializeRoles(): Promise<void> {
  try {
    await waitForMongoDB();

    console.log('Initializing custom roles...');

    // Create/update custom roles from config
    let rolesProcessed = 0;
    for (const roleConfig of config.roles) {
      const roleName = roleConfig.name.toUpperCase();
      
      // Skip system roles
      if (roleName === 'ADMIN' || roleName === 'USER') {
        console.log(`  ⚠ Skipping system role: ${roleName}`);
        continue;
      }

      const existingRole = await Role.findOne({ name: roleName });
      
      if (existingRole) {
        existingRole.permissions = roleConfig.permissions;
        await existingRole.save();
        console.log(`  ✓ Updated role: ${roleName}`);
      } else {
        await Role.create({
          name: roleName,
          permissions: roleConfig.permissions
        });
        console.log(`  ✓ Created role: ${roleName}`);
      }
      rolesProcessed++;
    }

    console.log(`✓ Processed ${rolesProcessed} custom role(s)`);

    // Assign admin role to default admins
    if (DEFAULT_ADMINS) {
      console.log('Assigning admin roles...');
      const adminEmails = DEFAULT_ADMINS.split(',')
        .map(email => email.trim())
        .filter(Boolean);
      
      let adminsAssigned = 0;
      for (const email of adminEmails) {
        const user = await User.findOne({ email });
        
        if (user) {
          if (user.role !== 'ADMIN') {
            await User.updateOne({ email }, { $set: { role: 'ADMIN' } });
            console.log(`  ✓ Assigned ADMIN to: ${email}`);
            adminsAssigned++;
          } else {
            console.log(`  - Already ADMIN: ${email}`);
          }
        } else {
          console.log(`  ⚠ User not found: ${email} (will be set on first login)`);
        }
      }
      console.log(`✓ Assigned ADMIN role to ${adminsAssigned} user(s)`);
    } else {
      console.log('ℹ No default admins configured (LIBRECHAT_DEFAULT_ADMINS)');
    }

    console.log('✓ Role initialization completed');
    
  } catch (error) {
    console.error('✗ Error during role initialization:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}
