import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  customAction,
  getSnap,
  getSnaps,
  sendHello,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ReconnectButton,
  Input,
  Card,
  ProtectButton,
  Table,
} from '../components';
import { ParamsType } from '../../../../types/params.type';
import Box from '../components/Box';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 1.6rem;
  margin-bottom: 1.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const StyledGroup = styled.div`
  border-radius: 1rem;
  padding: 2;
`;

const StyledDiv = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [threshold, setThreshold] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [groups, setGroups] = useState<[number, number, string][]>([
    [1, 1, 'Your personal group share 1'],
    [1, 1, 'Your personal group share 2'],
    [3, 5, 'Friends group share for Bob, Charlie, Dave, Frank and Grace'],
    [2, 6, 'Family group share for mom, dad, brother, sister and wife'],
  ]);
  const [newGroup, setNewGroup] = useState<[string, string, string]>([
    '',
    '',
    '',
  ]);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCustomAction = async (params: ParamsType) => {
    try {
      await customAction(params);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCustomAction({
      threshold,
      passphrase,
      groups,
    });
  };

  const removeIndexOfGroup = (index: number) => {
    const newState = [...groups];
    newState.splice(index, 1);
    setGroups(newState);
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>SpaceDev</Span>
      </Heading>
      <CardContainer>
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Protect your seed phrase',
            description: (
              <form onSubmit={onSubmit}>
                <StyledDiv>
                  <Input
                    label="Threshold"
                    name="threshold"
                    placeholder="2"
                    value={threshold}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setThreshold(e.target.value)
                    }
                  />
                  <Input
                    label="Passphrase"
                    name="passphrase"
                    placeholder=""
                    value={passphrase}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassphrase(e.target.value)
                    }
                  />
                </StyledDiv>

                <br />
                <Table
                  data={groups}
                  colums={['Groups', 'Signs', 'Total', '']}
                  removeAction={removeIndexOfGroup}
                />
                <br />
                <Box>+ Add one more</Box>
              </form>
            ),
            button: (
              <ProtectButton
                type="submit"
                onClick={onSubmit}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
      </CardContainer>
      {/* 
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Send Hello message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
      */}
    </Container>
  );
};

export default Index;
