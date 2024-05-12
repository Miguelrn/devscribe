import { createTheme } from "@mui/material";
import { blue } from "@mui/material/colors";


declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
      user: true;
      ia: true;
    }
}

const theme = createTheme({
    palette: {
        // primary: {
        //     main: '#93C5FD'
        // },
        text: {
            secondary: '#93C5FD', 
        },
    },
    components: {
        MuiPaper: {
            variants: [
                {
                    props: { variant: 'user' },
                    style: {
                        backgroundColor: '#1F2937',
                        color: '#93C5FD',
                        borderColor: blue[900],
                        borderWidth: '2px',
                        padding: '16px'
                    },
                },
                {
                    props: { variant: 'ia' },
                    style: {
                        backgroundColor: '#81c784',
                        color: '#388e3c',
                        borderColor: '#388e3c',
                        borderWidth: '2px',
                        padding: '16px'
                    },
                }
            ],
        },
        MuiButton: {
            styleOverrides: {
                colorPrimary: '#93C5FD'
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#93C5FD', 
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    color: '#93C5FD', 
                },
                root: {
                    backgroundColor: '#1F2937',
                    color: '#93C5FD',
                    
                    "& .MuiOutlinedInput-notchedOutline": {
                        border: `2px solid #93C5FD`,
                    },
                    "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                            border: `2px solid #93C5FD`,
                        },
                        
                    },
                    // '&:hover': {
                    //     border: "2px solid #93C5FD",
                    // },
                },
            },
        },

    },
});


export default theme;
  