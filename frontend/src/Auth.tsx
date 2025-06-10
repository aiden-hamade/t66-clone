import pb from './lib/pocketbase';
import { Button } from './components/ui/Button'
import {useState, useEffect} from 'react';
import { set } from 'react-hook-form';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  plan?: string; // adjust according to your schema
  // ... other fields
}

function GoogleAuth() {
  // Local state for user; we'll set to null or the user record object.
  const [user, setUser] = useState<UserRecord | null>(() => {
    // On mount, check if authStore already has a valid session
    if (pb.authStore.isValid && pb.authStore.record) {
      return pb.authStore.record as unknown as UserRecord;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to authStore changes: login, logout, token refresh, etc.
    const removeListener = pb.authStore.onChange(() => {
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser(pb.authStore.record as unknown as UserRecord);
      } else {
        setUser(null);
      }
    });
    return () => {
      removeListener();
    };
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // This opens the OAuth2 popup and waits for completion
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google',
        createData: {
          plan: 'free', // first time login, set default plan
        }
       });
      // After success, pb.authStore is updated and our onChange listener will run
      console.log('Logged in successfully:', authData);
      
      // Ensure user has a plan set
      const user = pb.authStore.record as unknown as UserRecord; 
      if (!user.plan){
        await pb.collection('users').update(user.id, { plan: 'free' }); // Ensure user has a plan set
      }

    } catch (err) {
      console.error('Google OAuth2 login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear(); // clears token & record
    // onChange listener will set user to null
  };

  // Render logic:
  if (loading) {
    return (
      <Button variant="secondary" disabled>
        Loading...
      </Button>
    );
  }

  if (!user) {
    // Not logged in
    return (
      <Button onClick={handleLogin}>
        Login
      </Button>
    );
  }

  // Logged in: display name and plan; you may style differently, or use a dropdown, etc.
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
        {/* You can put a logout icon here; for simplicity: */}
        Logout
      </Button>
    </div>
  );
}
export default GoogleAuth;

