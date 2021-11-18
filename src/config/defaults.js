import React from 'react';
import { styled, TextField, Stack } from '@mui/material';

import DateTimePicker from '@mui/lab/DateTimePicker';

const StyledStack = styled(Stack)(({ theme }) => ({
  margin: '1em 0',
  padding: '1em 1em',
  maxWidth: 600,
  marginLeft: 'auto',
  marginRight: 'auto',
  textAlign: 'center',
}));

const StyledStackRow = styled(Stack)(({ theme }) => ({
  // margin: '1em 0',
  // padding: '1em 1em',
  maxWidth: 600,
  // marginLeft: 'auto',
  // marginRight: 'auto',
  textAlign: 'center',
  // display: 'inline-block',
}));

export const DStackColumn = (props) => (
  // <div className="glass-solid">
  <StyledStack className="glass-solid" spacing={2} {...props} />
  // </div>
);

export const DStackRow = (props) => (
  // <div className="glass-solid">
  <StyledStackRow spacing={2} direction="row" {...props} />
  // </div>
);
export const DTextField = (props) => <TextField variant="outlined" style={{ flexGrow: 1 }} {...props} />;
export const DTextFieldInfo = (props) => (
  <DTextField
    variant="standard"
    inputProps={{
      readOnly: true,
    }}
    style={
      {
        // '.MuiInput-underline:before': {
        //   borderBottom: '2px solid red',
        // },
        /* hover (double-ampersand needed for specificity reasons. */
        // && .MuiInput-underline:hover:before {
        //   border-bottom: 2px solid lightblue;
        // }
        // /* focused */
        // .MuiInput-underline:after {
        //   border-bottom: 2px solid red;
        // }
      }
    }
    {...props}
  />
);
export const DDateTimePicker = ({ error, helperText, ...props }) => (
  <DateTimePicker
    {...props}
    renderInput={(params) => <DTextField {...params} error={error} helperText={helperText} />}
  />
);
