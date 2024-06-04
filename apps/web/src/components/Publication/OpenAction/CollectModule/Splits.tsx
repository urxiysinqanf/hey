import type { Profile, RecipientDataOutput } from '@hey/lens';
import type { FC } from 'react';

import Slug from '@components/Shared/Slug';
import { POLYGONSCAN_URL, REWARDS_ADDRESS } from '@hey/data/constants';
import formatAddress from '@hey/helpers/formatAddress';
import getAvatar from '@hey/helpers/getAvatar';
import getProfile from '@hey/helpers/getProfile';
import getStampFyiURL from '@hey/helpers/getStampFyiURL';
import { useProfilesQuery } from '@hey/lens';
import Link from 'next/link';

interface SplitsProps {
  recipients: RecipientDataOutput[];
}

const Splits: FC<SplitsProps> = ({ recipients }) => {
  const { data: recipientProfilesData, loading } = useProfilesQuery({
    skip: !recipients?.length,
    variables: {
      request: { where: { ownedBy: recipients?.map((r) => r.recipient) } }
    }
  });

  if (recipients.length === 0) {
    return null;
  }

  const getProfileByAddress = (address: string) => {
    const profiles = recipientProfilesData?.profiles?.items;
    if (profiles) {
      return profiles.find((p) => p.ownedBy.address === address);
    }
  };

  // Filter out the admin fee recipient
  const filteredRecipients = recipients.filter(
    (recipient) => recipient.recipient !== REWARDS_ADDRESS
  );

  // Calculate the total split of the filtered recipients
  const totalSplit = filteredRecipients.reduce(
    (acc, recipient) => acc + recipient.split,
    0
  );

  // Recalculate the splits so they sum up to 100%
  const adjustedRecipients = filteredRecipients.map((recipient) => ({
    ...recipient,
    split: (recipient.split / totalSplit) * 100
  }));

  return (
    <div className="space-y-2 pt-3">
      <div className="mb-2 font-bold">Fee recipients</div>
      {adjustedRecipients.map((recipient) => {
        const { recipient: address, split } = recipient;
        const profile = getProfileByAddress(address) as Profile;

        return (
          <div
            className="flex items-center justify-between text-sm"
            key={address}
          >
            <div className="flex w-full items-center space-x-2">
              {loading ? (
                <>
                  <div className="shimmer size-5 rounded-full" />
                  <div className="shimmer h-3 w-1/4 rounded-full" />
                </>
              ) : (
                <>
                  <img
                    alt="Avatar"
                    className="size-5 rounded-full border bg-gray-200 dark:border-gray-700"
                    src={profile ? getAvatar(profile) : getStampFyiURL(address)}
                  />
                  {profile ? (
                    <Link href={getProfile(profile).link}>
                      <Slug slug={getProfile(profile).slugWithPrefix} />
                    </Link>
                  ) : (
                    <Link
                      href={`${POLYGONSCAN_URL}/address/${address}`}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {formatAddress(address, 6)}
                    </Link>
                  )}
                </>
              )}
            </div>
            <div className="font-bold">{split.toFixed(2)}%</div>
          </div>
        );
      })}
    </div>
  );
};

export default Splits;
