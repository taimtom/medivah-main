'use client';

import { useMemo, forwardRef } from 'react';
import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

// ----------------------------------------------------------------------

const StyledEditor = styled(Box)(({ theme, error }) => ({
  '& .ql-container': {
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    borderColor: error ? theme.palette.error.main : theme.palette.divider,
    minHeight: 200,
    '& .ql-editor': {
      minHeight: 200,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      '&.ql-blank::before': {
        fontStyle: 'normal',
        color: theme.palette.text.disabled,
      },
      '& pre.ql-syntax': {
        ...theme.typography.body2,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.neutral,
      },
    },
  },
  '& .ql-toolbar': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderColor: error ? theme.palette.error.main : theme.palette.divider,
    '& .ql-stroke': {
      stroke: theme.palette.text.primary,
    },
    '& .ql-fill': {
      fill: theme.palette.text.primary,
    },
    '& .ql-picker-label': {
      color: theme.palette.text.primary,
    },
    '& .ql-picker-label:hover': {
      color: theme.palette.primary.main,
    },
    '& .ql-picker-label.ql-active': {
      color: theme.palette.primary.main,
    },
    '& .ql-picker-item:hover': {
      color: theme.palette.primary.main,
    },
    '& .ql-picker-item.ql-selected': {
      color: theme.palette.primary.main,
    },
    '& button:hover': {
      '& .ql-stroke': {
        stroke: theme.palette.primary.main,
      },
      '& .ql-fill': {
        fill: theme.palette.primary.main,
      },
    },
    '& button.ql-active': {
      '& .ql-stroke': {
        stroke: theme.palette.primary.main,
      },
      '& .ql-fill': {
        fill: theme.palette.primary.main,
      },
    },
  },
}));

// ----------------------------------------------------------------------

export const Editor = forwardRef(
  (
    { id, value, onChange, error, helperText, placeholder = 'Write something...', sx, ...other },
    ref
  ) => {
    const modules = useMemo(
      () => ({
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        clipboard: {
          matchVisual: false,
        },
      }),
      []
    );

    const formats = [
      'header',
      'font',
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'script',
      'blockquote',
      'code-block',
      'list',
      'bullet',
      'indent',
      'align',
      'link',
      'image',
      'video',
    ];

    return (
      <Box sx={sx}>
        <StyledEditor error={error}>
          <ReactQuill
            ref={ref}
            value={value || ''}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            theme="snow"
            {...other}
          />
        </StyledEditor>
        {helperText && (
          <FormHelperText error={error} sx={{ px: 2 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

Editor.displayName = 'Editor';

