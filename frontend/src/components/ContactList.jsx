/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Search, Plus, Edit, Trash2, User, Mail, Phone, Download } from 'lucide-react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const endpointURL = import.meta.env.VITE_ENDPOINT_URL;

export const ContactList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContacts, setTotalContacts] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('cards');

    const navigate = useNavigate();
    const {isDark} = useTheme();
    const {user} = useAuth();
    const contactsPerPage = 12;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchContacts();
    }, [currentPage, searchTerm, sortBy, sortOrder, user])

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: contactsPerPage,
                search: searchTerm,
                sortBy: sortBy,
                sortOrder: sortOrder.toUpperCase()
            }
            
         
            const response = await axios.get(`${endpointURL}/contacts`, {params});
            
            // The backend returns a rssponse of { data: { data: contacts[], total, page, limit, totalPages } }
            const { data } = response.data;
            (data)
            setContacts(data.data);
            setTotalContacts(data.total);
            setTotalPages(data.totalPages);

        } catch (error) {
            let errorMessage = 'Failed to fetch contacts';
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        errorMessage = 'Please log in to view contacts';
                        break;
                    case 403:
                        errorMessage = 'You do not have permission to view contacts';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later';
                        break;
                    default:
                        errorMessage = error.response.data?.message || 'Failed to fetch contacts';
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection';
            }
            toast.error(errorMessage);
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }

    const handleSort = (field) => {
        if (field === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    }

    const handleDelete = async (id) => {
        try{
            await axios.delete(`${endpointURL}/contacts/${id}`);
            toast.success('Contact Deleted Successfully');
            fetchContacts();
            setShowDeleteModal(false);
            setContactToDelete(true);
        } catch (error) {
            toast.error('Failed to delete the contact');
            console.error('Error deleting contact:', error);
        }
    }

    const confirmDelete = (contact) => {
        setContactToDelete(contact);
        setShowDeleteModal(true);
    };

    const exportContacts = async () => {
        try{
            const response = await axios.get(`${endpointURL}/contacts/export`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contacts.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Successfully exported the contacts");
        }
        catch (error) {
            toast.error("Failed to export contacts")
            console.error('Error exporting contacts:', error)
        }
    }

    const ContactCard = ({contact}) => {
        return (
            <Card 
                className="h-100 contact-card"
                style={{
                    backgroundColor: isDark ? '#2d2d2d' : '#fff',
                    border: isDark ? '1px solid #404040' : '1px solid #e9ecef',
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                <Card.Body className="d-flex flex-column p-4">
                    <div className="text-center mb-3">
                        {contact.profilePhoto ? (
                            <img
                                src={`${endpointURL}/uploads/${contact.profilePhoto}`}
                                alt={contact.name}
                                className="rounded-circle shadow-sm"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                style={{ 
                                    width: '60px', 
                                    height: '60px',
                                    backgroundColor: isDark ? '#404040' : '#f8f9fa',
                                    color: isDark ? '#ccc' : '#6c757d'
                                }}
                            >
                                <User size={24} />
                            </div>
                        )}
                    </div>
                    
                    <h6 
                        className="card-title text-center mb-3 text-truncate"
                        style={{ 
                            color: isDark ? '#fff' : '#333',
                            fontWeight: '500'
                        }}
                    >
                        {contact.name}
                    </h6>

                    <div className="mb-2">
                        <small 
                            className="d-flex align-items-center"
                            style={{ color: isDark ? '#bbb' : '#6c757d' }}
                        >
                            <Mail size={12} className="me-2 flex-shrink-0" />
                            <span className="text-truncate">{contact.email}</span>
                        </small>
                    </div>

                    <div className="mb-3">
                        <small 
                            className="d-flex align-items-center"
                            style={{ color: isDark ? '#bbb' : '#6c757d' }}
                        >
                            <Phone size={12} className="me-2 flex-shrink-0" />
                            {contact.phone}
                        </small>
                    </div>

                    <div className="mt-auto d-flex gap-2">
                        <Button 
                            variant={isDark ? "outline-light" : "outline-primary"}
                            size="sm"
                            className="flex-fill"
                            onClick={() => navigate(`/contacts/edit/${contact.id}`)}
                            style={{
                                fontSize: '0.75rem',
                                borderWidth: '1px'
                            }}
                        >
                            <Edit size={12} className="me-1" />
                            Edit
                        </Button>

                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(contact)}
                            style={{
                                fontSize: '0.75rem',
                                borderWidth: '1px'
                            }}
                        >
                            <Trash2 size={12}/>
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    const ContactTableRow = ({contact}) => (
        <tr
            className="custom-table-row"
            style={{ backgroundColor: isDark ? '#23272b' : '#fff' }}
        >
            <td style={{ color: isDark ? '#f8f9fa' : '#333', padding: '0.75rem' }}>
                <div className="d-flex align-items-center">
                    {contact.profilePhoto ? (
                        <img
                            src={`${endpointURL}/uploads/${contact.profilePhoto}`}
                            alt={contact.name}
                            className="rounded-circle me-3"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                    ) : (
                        <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ 
                                width: '32px', 
                                height: '32px',
                                backgroundColor: isDark ? '#404040' : '#f8f9fa',
                                color: isDark ? '#ccc' : '#6c757d'
                            }}
                        >
                            <User size={14} />
                        </div>
                    )}
                    <span style={{ fontWeight: '500' }}>{contact.name}</span>
                </div>
            </td>
            <td style={{ color: isDark ? '#f8f9fa' : '#333', padding: '0.75rem' }}>{contact.email}</td>
            <td style={{ color: isDark ? '#f8f9fa' : '#333', padding: '0.75rem' }}>{contact.phone}</td>
            <td style={{ color: isDark ? '#f8f9fa' : '#333', padding: '0.75rem' }}>
                {new Date(contact.createdAt).toLocaleDateString()}
            </td>
            <td style={{ padding: '0.75rem' }}>
                <div className="d-flex gap-1">
                    <Button
                        variant={isDark ? "outline-light" : "outline-primary"}
                        size="sm"
                        onClick={() => navigate(`/contacts/edit/${contact.id}`)}
                        style={{ fontSize: '0.75rem' }}
                    >
                        <Edit size={12} />
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmDelete(contact)}
                        style={{ fontSize: '0.75rem' }}
                    >
                        <Trash2 size={12} />
                    </Button>
                </div>
            </td>
        </tr>
    )

    const Pagination = () => {
        const pages = [];
        const MaxPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(MaxPages/ 2))
        let endPage = Math.min(totalPages, startPage + MaxPages - 1);
        
        if (endPage - startPage + 1 < MaxPages) {
            startPage = Math.max(1, endPage - MaxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }   

        return (
            <div className="d-flex justify-content-center align-items-center mt-4">
                <Button
                    variant={isDark ? "outline-light" : "outline-secondary"}
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="me-2"
                >
                    Previous
                </Button>
                
                {pages.map(page => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "primary" : (isDark ? "outline-light" : "outline-secondary")}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="me-1"
                    >
                        {page}
                    </Button>
                ))}
                
                <Button
                    variant={isDark ? "outline-light" : "outline-secondary"}
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="ms-1"
                >
                    Next
                </Button>
            </div>
        );
    }

    if (loading && contacts.length === 0) {
        return (
        <div 
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ 
                backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
                color: isDark ? '#fff' : '#333' 
            }}
        >
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading contacts...</p>
            </div>
        </div>
        );
    }

     return (
         <div 
            className="min-vh-100"
            style={{ 
                backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
                paddingTop: '2rem',
                paddingBottom: '2rem'
            }}
        >
            <Container>
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h3 
                                    className="mb-2"
                                    style={{ 
                                        color: isDark ? '#fff' : '#333',
                                        fontWeight: '600'
                                    }}
                                >
                                    My Contacts
                                </h3>
                                <Badge 
                                    bg={isDark ? "secondary" : "light"} 
                                    text={isDark ? "light" : "dark"}
                                    className="fs-6"
                                    style={{ fontWeight: '400' }}
                                >
                                    {totalContacts} contacts
                                </Badge>
                            </div>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant={isDark ? "outline-light" : "outline-success"}
                                    onClick={exportContacts}
                                    className="d-flex align-items-center"
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    <Download size={14} className="me-2" />
                                    Export
                                </Button>
                                <Button 
                                    variant="primary" 
                                    onClick={() => navigate('/contacts/new')}
                                    className="d-flex align-items-center"
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    <Plus size={14} className="me-2" />
                                    Add Contact
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Search and Filters */}
                <Row className="mb-4">
                    <Col md={6} className="mb-3 mb-md-0">
                        <InputGroup>
                            <InputGroup.Text 
                                style={{ 
                                    backgroundColor: isDark ? '#2d2d2d' : '#fff',
                                    borderColor: isDark ? '#404040' : '#ced4da',
                                    color: isDark ? '#ccc' : '#6c757d'
                                }}
                            >
                                <Search size={14} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={{
                                    backgroundColor: isDark ? '#2d2d2d' : '#fff',
                                    borderColor: isDark ? '#404040' : '#ced4da',
                                    color: isDark ? '#fff' : '#333'
                                }}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={3} className="mb-3 mb-md-0">
                        <Form.Select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                                setCurrentPage(1);
                            }}
                            style={{
                                backgroundColor: isDark ? '#2d2d2d' : '#fff',
                                borderColor: isDark ? '#404040' : '#ced4da',
                                color: isDark ? '#fff' : '#333'
                            }}
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="email-asc">Email (A-Z)</option>
                            <option value="email-desc">Email (Z-A)</option>
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <div className="d-flex gap-1">
                            <Button
                                variant={viewMode === 'cards' ? 'primary' : (isDark ? 'outline-light' : 'outline-secondary')}
                                onClick={() => setViewMode('cards')}
                                className="flex-fill"
                                size="sm"
                            >
                                Cards
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'primary' : (isDark ? 'outline-light' : 'outline-secondary')}
                                onClick={() => setViewMode('table')}
                                className="flex-fill"
                                size="sm"
                            >
                                Table
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Content */}
                {contacts.length === 0 ? (
                    <Row>
                        <Col className="text-center py-5">
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{ 
                                    width: '80px', 
                                    height: '80px',
                                    backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
                                    color: isDark ? '#666' : '#adb5bd'
                                }}
                            >
                                <User size={32} />
                            </div>
                            <h5 style={{ color: isDark ? '#ccc' : '#6c757d' }}>
                                No contacts found
                            </h5>
                            <p style={{ color: isDark ? '#999' : '#adb5bd' }} className="mb-4">
                                {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first contact'}
                            </p>
                            <Button variant="primary" onClick={() => navigate('/contacts/new')}>
                                <Plus size={16} className="me-2" />
                                Add Your First Contact
                            </Button>
                        </Col>
                    </Row>
                ) : (
                    <>
                        {viewMode === 'cards' ? (
                            <Row>
                                {contacts.map(contact => (
                                    <Col key={contact.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                        <ContactCard contact={contact} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Row>
                                <Col>
                                    <Card 
                                        style={{
                                            backgroundColor: isDark ? '#2d2d2d' : '#fff',
                                            border: isDark ? '1px solid #404040' : '1px solid #e9ecef'
                                        }}
                                    >
                                        <Card.Body className="p-0">
                                            <div className="table-responsive">
                                                <table
                                                    style={{
                                                        width: '100%',
                                                        backgroundColor: isDark ? '#23272b' : '#fff',
                                                        color: isDark ? '#f8f9fa' : '#212529',
                                                        borderCollapse: 'separate',
                                                        borderSpacing: 0
                                                    }}
                                                >
                                                    <thead
                                                        style={{
                                                            backgroundColor: isDark ? '#343a40' : '#f8f9fa',
                                                            color: isDark ? '#fff' : '#333',
                                                            borderBottom: isDark ? '1px solid #555' : '1px solid #dee2e6'
                                                        }}
                                                    >
                                                        <tr>
                                                            <th
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    color: isDark ? '#fff' : '#333',
                                                                    fontWeight: '500',
                                                                    backgroundColor: isDark ? '#343a40' : '#f8f9fa',
                                                                    padding: '0.75rem'
                                                                }}
                                                                onClick={() => handleSort('name')}
                                                            >
                                                                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                            </th>
                                                            <th
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    color: isDark ? '#fff' : '#333',
                                                                    fontWeight: '500',
                                                                    backgroundColor: isDark ? '#343a40' : '#f8f9fa',
                                                                    padding: '0.75rem'
                                                                }}
                                                                onClick={() => handleSort('email')}
                                                            >
                                                                Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                            </th>
                                                            <th style={{ color: isDark ? '#fff' : '#333', fontWeight: '500', backgroundColor: isDark ? '#343a40' : '#f8f9fa', padding: '0.75rem' }}>
                                                                Phone
                                                            </th>
                                                            <th
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    color: isDark ? '#fff' : '#333',
                                                                    fontWeight: '500',
                                                                    backgroundColor: isDark ? '#343a40' : '#f8f9fa',
                                                                    padding: '0.75rem'
                                                                }}
                                                                onClick={() => handleSort('createdAt')}
                                                            >
                                                                Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                            </th>
                                                            <th style={{ color: isDark ? '#fff' : '#333', fontWeight: '500', backgroundColor: isDark ? '#343a40' : '#f8f9fa', padding: '0.75rem' }}>
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody
                                                        style={{
                                                            backgroundColor: isDark ? '#23272b' : '#fff',
                                                            color: isDark ? '#f8f9fa' : '#212529'
                                                        }}
                                                    >
                                                        {contacts.map(contact => (
                                                            <ContactTableRow key={contact.id} contact={contact} />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                        
                        {totalPages > 1 && <Pagination />}
                    </>
                )}

                {/* Delete Confirmation Modal */}
                <Modal 
                    show={showDeleteModal} 
                    onHide={() => setShowDeleteModal(false)} 
                    centered
                    contentClassName={isDark ? 'bg-dark text-light' : ''}
                >
                    <Modal.Header 
                        closeButton 
                        style={{ 
                            backgroundColor: isDark ? '#2d2d2d' : '#fff',
                            borderBottom: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                        }}
                    >
                        <Modal.Title style={{ color: isDark ? '#fff' : '#333' }}>
                            Confirm Delete
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: isDark ? '#2d2d2d' : '#fff' }}>
                        <p style={{ color: isDark ? '#fff' : '#333' }}>
                            Are you sure you want to delete <strong>{contactToDelete?.name}</strong>?
                        </p>
                        <p style={{ color: isDark ? '#bbb' : '#6c757d', fontSize: '0.875rem' }}>
                            This action cannot be undone.
                        </p>
                    </Modal.Body>
                    <Modal.Footer 
                        style={{ 
                            backgroundColor: isDark ? '#2d2d2d' : '#fff',
                            borderTop: isDark ? '1px solid #404040' : '1px solid #dee2e6'
                        }}
                    >
                        <Button 
                            variant={isDark ? "outline-light" : "secondary"} 
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleDelete(contactToDelete?.id)}
                        >
                            <Trash2 size={14} className="me-2" />
                            Delete Contact
                        </Button>
                    </Modal.Footer>
                </Modal>

                <style>{`
                    .contact-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                    }
                    
                    .custom-table-row:hover {
                        background-color: ${isDark ? '#343a40' : 'rgba(0, 0, 0, 0.05)'} !important;
                    }
                `}</style>
            </Container>
        </div>
    );

}

