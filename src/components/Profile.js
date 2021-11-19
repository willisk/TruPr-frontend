import { useMoralisDapp } from '../providers/MoralisDappProvider/MoralisDappProvider';
import { useMoralis } from 'react-moralis';
import { getEllipsisTxt } from '../helpers/formatters';
import Blockie from './Blockie';
import { useState } from 'react';
import Address from './Address/Address';

const Profile = () => {
  const { setUserData, userError, isUserUpdating, user } = useMoralis();

  return <div>Nothing here for now</div>;
};

export default Profile;
