/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Spinner, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios';
import { ArrowLeft, Save, Upload, User, X } from 'lucide-react';
import { useTheme } from "../context/ThemeContext";

const endpointURL = import.meta.env.VITE_ENDPOINT_URL;

export const ContactForm = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const isEditing = Boolean(id);
    const { isDark } = useTheme();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        photo: null,
    });

    const [loading, setLoading] = useState(false);
    const [fetchingContact, setFetchingContact] = useState(isEditing);
    const [errors, setErrors] = useState({
        name: '',
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if(isEditing) {
            fetchContact();
        }
    }, [isEditing, id]);

    const fetchContact = async () => {
        try {
            setFetchingContact(true);
            const response = await axios.get(`${endpointURL}/contacts/${id}`);
            const contact = response.data.data;

            setFormData({
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                photo: null
            });

            if (contact.profilePhoto) {
                setPhoto(`${endpointURL}/uploads/${contact.profilePhoto}`);
            }
        } catch(error) {
            toast.error('Failed to fetch contact details');
            console.error('Error fetching contact:', error);
            navigate('/contacts');
        } finally {
            setFetchingContact(false);
        }
    }

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if(errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            console.log('Selected file:', file);
            setFormData(prev => ({
                ...prev,
                photo: file
            }));

            // Reader Previewer
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const removePhoto = () => {
        setFormData(prev => ({
            ...prev,
            photo: null
        }));

        setPhotoPreview(null);
        const fileInput = document.getElementById('photo-input');
        if(fileInput) {
            fileInput.value = '';
        }
    }

    const validateForm = () => {
        const newErrors = {};

        // Validation for name
        if (!formData.name.trim()) {
        newErrors.name = 'Name is required!!!';
        } 
        else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
        }

        // Validation for email
        if (!formData.email.trim()) {
        newErrors.email = 'Email is required!!!';
        } 
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        }

        // Validatoin for phone
        if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required!!!';
        } else if (!/^[\d\s\-+\\(\\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors below');
            return;
        }

        setLoading(true);
        try {
            const dataForm = new FormData();
            dataForm.append('name', formData.name.trim());
            dataForm.append('email', formData.email.trim());
            dataForm.append('phone', formData.phone.trim());

            if(formData.photo){
                console.log('Appending photo to form:', formData.photo);
                dataForm.append('file', formData.photo);
            }

            console.log('Form data being sent:', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                hasPhoto: !!formData.photo
            });

            if(isEditing){
                const response = await axios.put(`${endpointURL}/contacts/${id}`, dataForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('Update response:', response.data);
                toast.success('Contact updated successfully!');
            } else {
                const response = await axios.post(`${endpointURL}/contacts`, dataForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('Create response:', response.data);
                toast.success('Contact saved successfully!');
            }
            navigate('/contacts');

        } catch (error) {
            console.error('Error saving contact:', error);
            if (error.response) {
                const { status, data } = error.response;
                console.error('Error response:', { status, data });
                
                if (status === 400 && data.errors) {
                    // Handle validation errors from backend
                    const backendErrors = {};
                    data.errors.forEach(err => {
                        backendErrors[err.field] = err.message;
                    });
                    setErrors(backendErrors);
                    toast.error('Please fix the validation errors');
                } 
                else if (status === 409) {
                    toast.error('A contact with this email already exists');
                    setErrors({ email: 'This email is already in use' });
                } 
                else {
                    toast.error(data.message || 'Failed to save contact');
                }
            } else {
                toast.error('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetchingContact) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading contact details...</p>
      </Container>
    );
  }

  return (
    <div className={`min-vh-100 ${isDark ? 'bg-dark' : 'bg-light'}`}>
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className={`shadow-sm border-0 ${isDark ? 'bg-dark text-light' : 'bg-white'}`}>
                        <Card.Header className="bg-primary text-white py-3">
                            <div className="d-flex align-items-center">
                                <Button
                                    variant="link"
                                    className="text-white p-0 me-3"
                                    onClick={() => navigate('/contacts')}
                                >
                                    <ArrowLeft size={18} />
                                </Button>
                                <h5 className="mb-0">
                                    {isEditing ? 'Edit Contact' : 'Add New Contact'}
                                </h5>
                            </div>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Form onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}>
                                {/* Photo Upload Section */}
                                <div className="text-center mb-4">
                                    <div className="position-relative d-inline-block">
                                        {photoPreview || photo ? (
                                            <div className="position-relative">
                                                <img
                                                    src={photoPreview || photo}
                                                    alt="Contact preview"
                                                    className="rounded-circle"
                                                    style={{ 
                                                        width: '100px', 
                                                        height: '100px', 
                                                        objectFit: 'cover',
                                                        border: '3px solid #fff',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 rounded-circle"
                                                    style={{ transform: 'translate(25%, -25%)' }}
                                                    onClick={removePhoto}
                                                >
                                                    <X size={12} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div 
                                                className={`rounded-circle d-flex align-items-center justify-content-center border ${
                                                    isDark ? 'bg-dark border-secondary' : 'bg-light'
                                                }`}
                                                style={{ 
                                                    width: '100px', 
                                                    height: '100px'
                                                }}
                                            >
                                                <User size={32} className={isDark ? 'text-secondary' : 'text-muted'} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-3">
                                        <Form.Label 
                                            htmlFor="photo-input" 
                                            className={`btn btn-outline-primary btn-sm rounded-pill px-3 ${
                                                isDark ? 'border-secondary text-light' : ''
                                            }`}
                                        >
                                            <Upload size={14} className="me-2" />
                                            {photoPreview || photo ? 'Change Photo' : 'Upload Photo'}
                                        </Form.Label>
                                        <Form.Control
                                            type="file"
                                            id="photo-input"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="d-none"
                                        />
                                        <div className={`small mt-2 ${isDark ? 'text-secondary' : 'text-muted'}`}>
                                            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                                        </div>
                                    </div>
                                </div>

                                {/* Name Field */}
                                <Form.Group className="mb-3">
                                    <Form.Label className={`fw-medium ${isDark ? 'text-light' : ''}`}>
                                        Full Name *
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.name}
                                        placeholder="Enter full name"
                                        className={`py-2 ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                        autoFocus
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Email Field */}
                                <Form.Group className="mb-3">
                                    <Form.Label className={`fw-medium ${isDark ? 'text-light' : ''}`}>
                                        Email Address *
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.email}
                                        placeholder="Enter email address"
                                        className={`py-2 ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Phone Field */}
                                <Form.Group className="mb-4">
                                    <Form.Label className={`fw-medium ${isDark ? 'text-light' : ''}`}>
                                        Phone Number *
                                    </Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.phone}
                                        placeholder="Enter phone number"
                                        className={`py-2 ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Form Actions */}
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={isDark ? "outline-light" : "light"}
                                        onClick={() => navigate('/contacts')}
                                        disabled={loading}
                                        className="flex-fill py-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                        className="flex-fill py-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                {isEditing ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Save size={14} className="me-2" />
                                                {isEditing ? 'Update Contact' : 'Create Contact'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </div>
  );
}