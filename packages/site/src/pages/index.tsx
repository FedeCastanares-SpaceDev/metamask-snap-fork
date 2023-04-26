import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { protectPrivateKeyAction, recoverAction } from '../utils';
import { Input, Card, ProtectButton, Table, ButtonBase } from '../components';
import { ParamsType } from '../../../../types/params.type';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;

const Span = styled.span`
  color: #43a7ff;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 90vw;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
  gap: 4rem;
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

const StyledDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [threshold, setThreshold] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [groups, setGroups] = useState<[number, number, string][]>([
    [1, 1, 'Your personal group share 1'],
    [1, 1, 'Your personal group share 2'],
    [3, 5, 'Friends with group share'],
    [2, 6, 'Family with group share'],
  ]);
  const [showNewGroupInputs, setShowNewGroupInputs] = useState(false);
  const [newGroup, setNewGroup] = useState<string[]>(['', '', '']);

  const [shares, setShares] = useState<string[]>(['']);
  const [passphraseForRecover, setPassphraseForRecover] = useState('');

  const [error, setError] = useState('');

  const handleRecoverAction = () =>
    recoverAction({
      shares,
      passphrase: passphraseForRecover,
    });

  const handleProtectPrivateKeyAction = async (params: ParamsType) => {
    try {
      await protectPrivateKeyAction(params);
    } catch (e) {
      showError(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      handleProtectPrivateKeyAction({
        threshold,
        passphrase,
        groups,
      });
    } catch (error) {
      dispatch({ type: MetamaskActions.SetError, payload: error });
      showError(error);
    }
  };

  const removeIndexOfGroup = (index: number) => {
    const newState = [...groups];
    newState.splice(index, 1);
    setGroups(newState);
  };

  const showError = (error: any) => {
    setError(error.message);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <Container>
      <form onSubmit={onSubmit}>
        <Heading>
          Welcome to <Span>Ethereum Uruguay 🇺🇾</Span>
        </Heading>
        <CardContainer>
          <Card
            content={{
              title: 'Protect your private key',
              description: (
                <>
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
                  {showNewGroupInputs && (
                    <>
                      <StyledDiv>
                        <Input
                          label="Signs"
                          name="signs"
                          placeholder="3"
                          value={newGroup[0]}
                          style={{ width: '2rem' }}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const stateCopy = [...newGroup];
                            stateCopy[0] = e.target.value;
                            setNewGroup(stateCopy);
                          }}
                        />
                        <Input
                          label="Total"
                          name="total"
                          placeholder="5"
                          value={newGroup[1]}
                          style={{ width: '2rem' }}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const stateCopy = [...newGroup];
                            stateCopy[1] = e.target.value;
                            setNewGroup(stateCopy);
                          }}
                        />
                        <Input
                          label="Description"
                          name="description"
                          placeholder=""
                          value={newGroup[2]}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const stateCopy = [...newGroup];
                            stateCopy[2] = e.target.value;
                            setNewGroup(stateCopy);
                          }}
                        />

                        <StyledDiv>
                          <IconButton
                            sx={{ height: 40, width: 40 }}
                            color="secondary"
                            onClick={() => setShowNewGroupInputs(false)}
                          >
                            <CloseIcon />
                          </IconButton>
                          <IconButton
                            sx={{ height: 40, width: 40 }}
                            color="inherit"
                            onClick={() => {
                              setShowNewGroupInputs(false);
                              setGroups([
                                ...groups,
                                [
                                  Number(newGroup[0]),
                                  Number(newGroup[1]),
                                  newGroup[2],
                                ],
                              ]);
                              setNewGroup(['', '', '']);
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </StyledDiv>
                      </StyledDiv>
                      <br />
                    </>
                  )}
                  <ButtonBase
                    onClick={() => setShowNewGroupInputs(true)}
                    type="button"
                  >
                    + Add one more
                  </ButtonBase>
                  <br />
                  <ProtectButton
                    type="submit"
                    onClick={onSubmit}
                    disabled={!state.installedSnap || !passphrase || !threshold}
                  />
                </>
              ),
            }}
            disabled={!state.installedSnap}
          />
          <Card
            content={{
              title: 'Recover your private key',
              description: (
                <>
                  <StyledDiv>
                    <p>Shares:</p>
                    <Input
                      label="Passphrase"
                      name="passphrase"
                      placeholder=""
                      value={passphraseForRecover}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassphraseForRecover(e.target.value)
                      }
                    />
                  </StyledDiv>

                  {shares.map((share, index) => (
                    <div key={index}>
                      <Input
                        type="textarea"
                        label={`Share ${index + 1}`}
                        name={`share ${index + 1}`}
                        value={shares[index]}
                        placeholder=""
                        onChange={(
                          e: React.ChangeEvent<HTMLTextAreaElement>,
                        ) => {
                          const copyOfShares = [...shares];
                          copyOfShares[index] = e.target.value;
                          setShares(copyOfShares);
                        }}
                      />
                      <br />
                    </div>
                  ))}

                  <ButtonBase
                    onClick={() => setShares([...shares, ''])}
                    type="button"
                  >
                    + Add one more
                  </ButtonBase>
                  <br />
                  <ButtonBase type="button" onClick={handleRecoverAction}>
                    Retrieve private key
                  </ButtonBase>
                </>
              ),
            }}
            disabled={!state.installedSnap}
          />
        </CardContainer>
      </form>
      {error !== '' && (
        <Alert
          severity="error"
          color="error"
          variant="filled"
          sx={{ fontSize: 24, position: 'absolute', top: '10vh' }}
        >
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default Index;
