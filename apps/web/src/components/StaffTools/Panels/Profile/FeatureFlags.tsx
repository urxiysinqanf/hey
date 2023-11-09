import { FlagIcon } from '@heroicons/react/24/outline';
import { PREFERENCES_WORKER_URL } from '@hey/data/constants';
import type { Profile } from '@hey/lens';
import { Modal } from '@hey/ui';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type FC, useState } from 'react';

import UpdateFeatureFlags from './UpdateFeatureFlags';

interface FeatureFlagsProps {
  profile: Profile;
}

const FeatureFlags: FC<FeatureFlagsProps> = ({ profile }) => {
  const [showFeatureFlagsModal, setShowFeatureFlagsModal] = useState(false);

  const getFeatureFlags = async (): Promise<string[]> => {
    try {
      const response = await axios.get(
        `${PREFERENCES_WORKER_URL}/getFeatureFlags`,
        { params: { id: profile.id } }
      );
      const { data } = response;

      return data?.features || [];
    } catch (error) {
      return [];
    }
  };

  const { data: featureFlags, isLoading } = useQuery({
    queryKey: ['getFeatureFlags', profile.id],
    queryFn: getFeatureFlags,
    enabled: Boolean(profile.id)
  });

  const flags = featureFlags || [];

  return (
    <>
      <div className="mt-5 flex items-center space-x-2 text-yellow-600">
        <FlagIcon className="h-5 w-5" />
        <div className="text-lg font-bold">Feature flags</div>
      </div>
      <div className="mt-3 space-y-2 font-bold">
        {isLoading ? (
          <div>Loading...</div>
        ) : flags.length > 0 ? (
          <div>
            {flags.map((flag) => (
              <div key={flag}>{flag}</div>
            ))}
          </div>
        ) : (
          <div>No feature flags</div>
        )}
        <button
          className="text-sm underline"
          onClick={() => setShowFeatureFlagsModal(true)}
        >
          Update feature flags
        </button>
        <Modal
          show={showFeatureFlagsModal}
          onClose={() => setShowFeatureFlagsModal(false)}
          title="Update feature flags"
          icon={<FlagIcon className="text-brand-500 h-5 w-5" />}
        >
          <UpdateFeatureFlags flags={flags} profile={profile} />
        </Modal>
      </div>
    </>
  );
};

export default FeatureFlags;
