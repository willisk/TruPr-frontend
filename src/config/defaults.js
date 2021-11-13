import React from 'react';
import { styled, MenuItem, Button, TextField, Stack, InputAdornment } from '@mui/material';

import DateTimePicker from '@mui/lab/DateTimePicker';

const StyledStack = styled(Stack)(({ theme }) => ({
  padding: '2em 1em',
  maxWidth: 600,
  margin: 'auto',
  textAlign: 'center',
}));

export const DStack = (props) => (
  <div className="glass-solid">
    <StyledStack spacing={2} {...props} />
  </div>
);
export const DTextField = (props) => <TextField variant="outlined" {...props} />;
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
