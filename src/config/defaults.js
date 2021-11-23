import React, { Fragment } from 'react';
import { styled, TextField, Stack, Tooltip } from '@mui/material';

import DateTimePicker from '@mui/lab/DateTimePicker';

import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

export const LabelWithText = ({ label, text, variant = 'subtle', placement = 'left', textStyle = {} }) => {
  return (
    <LabelWith label={label} variant={variant} placement={placement}>
      <Typography
        style={{
          textAlign: 'left',
          ...textStyle,
        }}
      >
        {text}
      </Typography>
    </LabelWith>
  );
};

export const LabelWith = ({ label, children, variant = 'subtle', placement = 'left' }) => {
  var labelStyle = variant === 'subtle' ? { color: 'subtle', fontSize: '14px' } : {};
  if (placement === 'right') labelStyle.paddingLeft = '0.5em';
  if (placement === 'left') labelStyle.paddingRight = '0.5em';

  var divStyle = { marginBlock: 'auto' };
  const placementBefore = placement === 'top' || placement === 'left';

  if (placement === 'left' || placement === 'right') divStyle.display = 'inline-flex';

  const labelComponent = label && (
    <div style={divStyle}>
      <Typography
        // variant="h4"
        sx={{
          textAlign: 'left',
          ...labelStyle,
          // fontWeight: '400',
        }}
      >
        {label}
      </Typography>
    </div>
  );

  return (
    <Box style={divStyle}>
      {placementBefore && labelComponent}
      {children}
      {!placementBefore && labelComponent}
    </Box>
  );
};

export const Label = ({ description, children, tooltip, disabled, style = {} }) => {
  if (disabled) style.color = 'disabled';
  return (
    <div style={{ display: 'inline-flex' }}>
      <div style={{ marginBlock: 'auto' }}>
        <Typography
          // variant="h4"
          sx={{
            textAlign: 'left',
            ...style,
            // margin: 'auto',
            // display: 'inline-flex',
            // marginTop: '30px',
            // fontWeight: '400',
          }}
        >
          {description}
        </Typography>
      </div>
      {tooltip && (
        <div style={{ marginInline: '1em', marginBlock: 'auto' }}>
          {/* <div style={{ marginLeft: '1em', marginRight: '1em', margin: 'auto' }}> */}
          <Tooltip title={tooltip} placement="top">
            {/* {'?'} */}
            <Typography sx={{ color: '#9e9e9e' }}>?</Typography>
          </Tooltip>
        </div>
      )}
      {children}
      {/* <Typography variant="body1" style={{ textAlign: 'left', marginTop: '5px' }}>
      {text}
    </Typography> */}
    </div>
  );
};

const StyledStack = styled(Stack)(({ theme }) => ({
  margin: '1em 0',
  padding: '1em 1em',
  maxWidth: 600,
  marginLeft: 'auto',
  marginRight: 'auto',
  textAlign: 'center',
}));

const StyleRow = styled(Stack)(({ theme }) => ({
  // margin: '1em 0',
  // padding: '1em 1em',
  maxWidth: 600,
  // marginLeft: 'auto',
  // marginRight: 'auto',
  textAlign: 'center',
  display: 'inline-flex',
  justifyContent: 'space-between',
  // margin: 'auto',
}));

export const DStackColumn = (props) => (
  <StyledStack className="glass-solid" sx={{ background: 'white' }} spacing={2} {...props} />
);

export const Row = (props) => <StyleRow spacing={2} direction="row" {...props} />;

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
