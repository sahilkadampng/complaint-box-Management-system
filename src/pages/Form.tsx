import React from 'react';
import styled from 'styled-components';
import { useNotification } from '@/context/NotificationContext';

interface FormProps {
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxFiles?: number;
    maxSizeMB?: number;
}

const FileUpload: React.FC<FormProps> = ({ id = 'file', onChange, maxFiles = 5, maxSizeMB = 10 }) => {
    const { showError, showSuccess } = useNotification();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (files.length > maxFiles) {
            showError(`You can upload up to ${maxFiles} files.`);
            // Clear the input
            (e.target as HTMLInputElement).value = '';
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.size > maxSizeMB * 1024 * 1024) {
                showError(`${f.name} exceeds the ${maxSizeMB}MB limit.`);
                (e.target as HTMLInputElement).value = '';
                return;
            }
        }

        // If all validations pass, forward the event
        if (onChange) onChange(e);
        else showSuccess('Files selected');
    };

    return (
        <StyledWrapper>
            <label htmlFor={id} className="custum-file-upload">
                <div className="icon text-white">
                    <div className="flex justify-center items-center h-32">
                        <img
                            src="https://cdn-icons-png.flaticon.com/128/3175/3175637.png"
                            alt="Upload Icon"
                            className="h-10 w-10 mt-6"
                        />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Upload supporting documents (images, PDFs, Word docs)</p>
                    <p className="text-xs text-gray-500 mb-8">
                        Max {maxFiles} files, {maxSizeMB}MB each. Supported: JPG, PNG, GIF, PDF, TXT, DOC, DOCX
                    </p>
                </div>
                <input
                    id={id}
                    type="file"
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileChange}
                    multiple
                />
            </label>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  .custum-file-upload {
    height: 200px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: 2px dashed #c5c5c5ff;
    background-color: #ffffffff;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0px 48px 35px -48px #ddddddff;
    transition: background 0.2s ease;
  }

  .custum-file-upload:hover {
    background-color: #f8f8f8ff;
  }

  .custum-file-upload .text span {
    font-weight: 400;
    color: #808080ff;
  }

  .custum-file-upload input {
    display: none;
  }
    .text {
    color: #000000ff;
}
`;

export default FileUpload;
