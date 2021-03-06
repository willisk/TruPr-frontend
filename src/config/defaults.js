import React, { Fragment } from 'react';
import { styled, TextField, Stack, Tooltip } from '@mui/material';

import DateTimePicker from '@mui/lab/DateTimePicker';

import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

export const LabelWithText = ({ label, text, variant = 'subtle', placement = 'left', tooltip, textStyle = {} }) => {
  return (
    <LabelWith label={label} variant={variant} placement={placement} tooltip={tooltip}>
      <div style={{ marginBlock: 'auto' }}>
        <Typography
          style={{
            textAlign: 'left',
            ...textStyle,
          }}
        >
          {text}
        </Typography>
      </div>
    </LabelWith>
  );
};

export const RowLabel = (props) => (
  <LabelWith tooltipPlacement="?" variant="standard" style={{ width: '100%' }} {...props} />
);

export const LabelWith = ({
  label,
  children,
  variant = 'subtle',
  tooltip,
  tooltipPlacement = 'label',
  placement = 'left',
  style = {},
  labelStyle = {},
}) => {
  if (variant === 'subtle') labelStyle = { ...labelStyle, color: 'subtle', fontSize: '14px' };
  if (placement === 'right') labelStyle.paddingLeft = '0.5em';
  if (placement === 'left') labelStyle.paddingRight = '0.5em';

  var divStyle = {
    marginBlock: 'auto',
    textAlign: 'left', // remove textAlign for top-centered label
    // width: '100%',
    // display: 'inline-flex',
  };
  const placementBefore = placement === 'top' || placement === 'left';

  if (placement === 'left' || placement === 'right')
    divStyle = { ...divStyle, display: 'inline-flex', justifyContent: 'space-between' };

  var labelElement = label && (
    <div style={{ marginBlock: 'auto', display: 'inline-flex' }}>
      <Typography inline sx={{ textAlign: 'left', ...labelStyle }}>
        {label}
      </Typography>

      {tooltip && tooltipPlacement === '?' && (
        <Tooltip title={tooltip} placement="top" style={{ marginInline: '0.5em' }}>
          <Typography inline sx={{ ...labelStyle, color: '#9e9e9e' }}>
            ?
          </Typography>
        </Tooltip>
      )}
    </div>
  );

  if (tooltip && tooltipPlacement === 'label')
    labelElement = label && (
      <Tooltip placement="top" title={tooltip}>
        {labelElement}
      </Tooltip>
    );

  if (tooltip && tooltipPlacement === 'children')
    children = (
      <Tooltip placement="top" title={tooltip}>
        {children}
      </Tooltip>
    );

  var component = (
    <Box sx={{ ...divStyle, ...style }}>
      <Fragment>
        {/* <div style={{ display: 'inline-flex', marginBlock: 'auto', justifyContent: 'space-between' }}> */}
        {placementBefore && labelElement}
        {/* <div style={{ marginBlock: 'auto' }}>{children}</div> */}
        {children}
        {!placementBefore && labelElement}
      </Fragment>
    </Box>
  );

  // if (tooltip && tooltipPlacement === 'component')
  //   component = (
  //     <Tooltip placement="top" title={tooltip}>
  //       {component}
  //     </Tooltip>
  //   );

  return component;
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
  // display: 'inline-fuck',
  justifyContent: 'space-between',
  // margin: 'auto',
}));

export const DStackColumn = (props) => (
  <StyledStack className="glass-solid" sx={{ background: 'white' }} spacing={2} {...props} />
);

export const Row = (props) => <StyleRow spacing={4} direction="row" {...props} />;

export const StyledTextField = (props) => (
  <TextField
    variant="outlined"
    {...props}
    style={{
      width: '250px',
      height: '3.4em',
      marginBlock: '0.5em',
      ...props.style,
    }}
  />
);

export const StyledTextFieldInfo = (props) => (
  <StyledTextField
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
    renderInput={(params) => <StyledTextField {...params} error={error} helperText={helperText} />}
  />
);
