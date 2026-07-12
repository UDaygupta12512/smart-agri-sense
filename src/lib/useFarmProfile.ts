'use client';

import { useEffect, useState } from 'react';
import { FARM_PROFILE_UPDATED_EVENT, loadFarmProfile, saveFarmProfile, type FarmProfile } from '@/lib/farmProfile';

export function useFarmProfile() {
  const [profile, setProfileState] = useState<FarmProfile>(() => loadFarmProfile());

  useEffect(() => {
    const syncProfile = () => {
      setProfileState(loadFarmProfile());
    };

    syncProfile();
    window.addEventListener(FARM_PROFILE_UPDATED_EVENT, syncProfile);
    window.addEventListener('storage', syncProfile);

    return () => {
      window.removeEventListener(FARM_PROFILE_UPDATED_EVENT, syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, []);

  const setProfile = (nextValue: FarmProfile | ((current: FarmProfile) => FarmProfile)) => {
    setProfileState((current) => {
      const nextProfile = typeof nextValue === 'function' ? nextValue(current) : nextValue;
      return saveFarmProfile(nextProfile);
    });
  };

  return {
    profile,
    setProfile,
    refreshProfile: () => setProfileState(loadFarmProfile()),
  };
}
