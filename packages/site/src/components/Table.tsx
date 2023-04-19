import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Table as TableMUI } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Fab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 18,
    fontWeight: 700,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createData(message: string, sign: number, total: number) {
  return { sign, total, message };
}

export function Table({
  data,
  colums,
  removeAction,
}: {
  data: [number, number, string][];
  colums: string[];
  removeAction: (index: number) => void;
}) {
  const rows = data.map((row) => createData(row[2], row[0], row[1]));

  return (
    <TableContainer component={Paper}>
      <TableMUI aria-label="customized table">
        <TableHead>
          <TableRow>
            {colums.map((colum) => (
              <StyledTableCell key={colum}>{colum}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <StyledTableRow key={row.message}>
              <StyledTableCell component="th" scope="row">
                {row.message}
              </StyledTableCell>
              <StyledTableCell align="right">{row.sign}</StyledTableCell>
              <StyledTableCell align="right">{row.total}</StyledTableCell>
              <StyledTableCell align="right">
                <Fab
                  sx={{ color: 'white' }}
                  size="small"
                  color="secondary"
                  onClick={() => removeAction(index)}
                >
                  <CloseIcon />
                </Fab>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </TableMUI>
    </TableContainer>
  );
}
