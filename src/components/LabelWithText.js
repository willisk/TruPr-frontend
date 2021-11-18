import Typography from '@mui/material/Typography';

const LabelWithText = (label, text) => {
    return (
        <>
             <Typography
                variant="h4"
                style={{
                    textAlign: 'left',
                    fontSize: '12px',
                    marginTop: '30px',
                    fontWeight: '400',
                    color: 'rgba(255, 255, 255, 0.7)',
                }}
            >
            {label}
            </Typography>
            <Typography variant="body1" style={{ textAlign: 'left', marginTop: '5px' }}>{text}</Typography>
        </>
    )
}

export default LabelWithText;