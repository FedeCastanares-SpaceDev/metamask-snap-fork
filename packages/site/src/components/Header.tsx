import { useContext } from 'react';
import styled, { useTheme } from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getThemePreference,
  getSnap,
  sendHello,
  sendTransaction,
  getAddresses,
  saveAddress,
  cleanData,
} from '../utils';
import { ButtonBase, HeaderButtons } from './Buttons';
import SpaceLogoImage from '../assets/space-logo-horizontal.png';
import { Toggle } from './Toggle';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border.default};
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const theme = useTheme();
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleConnectClick = async () => {
    try {
      await connectSnap('npm:metamask-snaps-spacedev', { version: '0.3.1' });
      const installedSnap = await getSnap('0.3.1');

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <img src={SpaceLogoImage} alt="Logo Spacedev" height={64} />
      </LogoWrapper>
      <RightContainer>
        {state.installedSnap && (
          <>
            <ButtonBase onClick={() => sendHello()}>Hello</ButtonBase>
            <ButtonBase onClick={() => cleanData()}>Clean data</ButtonBase>
            <ButtonBase onClick={() => getAddresses()}>
              Get addresses
            </ButtonBase>
            <ButtonBase onClick={() => saveAddress()}>Save address</ButtonBase>
            <ButtonBase onClick={() => sendTransaction()}>Transfer</ButtonBase>
          </>
        )}
        <Toggle
          onToggle={handleToggleClick}
          defaultChecked={getThemePreference()}
        />
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </RightContainer>
    </HeaderWrapper>
  );
};
