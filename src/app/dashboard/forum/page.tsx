'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ForumPostCard from '@/components/forum/ForumPostCard';
import { Search, Plus, Filter, MessageCircle, X, AlertCircle } from 'lucide-react';

interface ForumPost {
    id: number;
    title: string;
    author: string;
    category: string;
    content: string;
    likes: number;
    comments: number;
    createdAt: number;
    isVerified?: boolean;
}

interface FormErrors {
    title?: string;
    content?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_POSTS: ForumPost[] = [
    {
        id: 1,
        title: 'Best organic fertilizer for wheat?',
        author: 'Dr. Sharma',
        category: 'Organic Farming',
        content: 'I have been analyzing different organic fertilizer mixes for wheat crops in Northern regions. A combination of well-composed cow dung, neem cake, and vermicompost has shown the best yield improvements in our recent trials. Happy to answer any questions!',
        likes: 156,
        comments: 24,
        createdAt: new Date(CURRENT_YEAR, new Date().getMonth(), new Date().getDate() - 1, 14, 30).getTime(),
        isVerified: true,
    },
    {
        id: 2,
        title: 'Dealing with heavy rainfall in harvest season',
        author: 'Sunita Devi',
        category: 'Crop Management',
        content: 'Unexpected rains are predicted for next week when my paddy is ready for harvest. What are some quick ways to protect the crop in the field or accelerate drying post-harvest?',
        likes: 45,
        comments: 15,
        createdAt: new Date(CURRENT_YEAR, new Date().getMonth(), new Date().getDate() - 2, 9, 15).getTime(),
    },
    {
        id: 3,
        title: `Subsidies for Solar Pumps in ${CURRENT_YEAR}`,
        author: 'Amit Patel',
        category: 'Schemes & Subsidies',
        content: `Has the government announced the updated list of subsidies for solar water pumps for ${CURRENT_YEAR}? I heard there might be an increase in the coverage percentage.`,
        likes: 67,
        comments: 21,
        createdAt: new Date(CURRENT_YEAR, new Date().getMonth(), new Date().getDate() - 3, 11, 45).getTime(),
    },
    {
        id: 4,
        title: 'Pest identification helper needed',
        author: 'Kishan Singh',
        category: 'Pest Control',
        content: 'Found these small white bugs on the underside of my tomato leaves. They leave a sticky residue. Are these Mealybugs? What is the best immediate treatment?',
        likes: 12,
        comments: 4,
        createdAt: new Date(CURRENT_YEAR, new Date().getMonth(), new Date().getDate() - 5, 16, 20).getTime(),
    },
];

const STORAGE_KEY = 'forumPosts';

function getTimeAgo(ts: number): string {
    const diffMs = Date.now() - ts;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(ts).toLocaleDateString('en-IN');
}

const categories = ['All', 'Organic Farming', 'Crop Management', 'Pest Control', 'Schemes & Subsidies', 'Equipment'];

export default function ForumPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Crop Management');
    const [newContent, setNewContent] = useState('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    useEffect(() => {
        fetch('/api/forum')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const initialIds = new Set(INITIAL_POSTS.map(p => p.id));
                    const extraPosts = data.filter((p: ForumPost) => !initialIds.has(p.id));
                    if (extraPosts.length > 0) {
                        setPosts([...extraPosts, ...INITIAL_POSTS]);
                    }
                }
            })
            .catch(err => console.error('Failed to load forum posts:', err));
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setFormErrors({});
    }, []);

    // Handle Escape key to close modal
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    }, [closeModal]);

    useEffect(() => {
        if (showModal) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [showModal, handleKeyDown]);



    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) {
            errors.title = 'Title is required.';
        } else if (trimmedTitle.length < 5) {
            errors.title = 'Title must be at least 5 characters.';
        } else if (trimmedTitle.length > 150) {
            errors.title = 'Title cannot exceed 150 characters.';
        }

        const trimmedContent = newContent.trim();
        if (!trimmedContent) {
            errors.content = 'Description is required.';
        } else if (trimmedContent.length < 20) {
            errors.content = 'Description must be at least 20 characters.';
        } else if (trimmedContent.length > 2000) {
            errors.content = 'Description cannot exceed 2000 characters.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNewPost = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const post: ForumPost = {
            id: Date.now(),
            title: newTitle.trim(),
            author: localStorage.getItem('userName') || 'You',
            category: newCategory,
            content: newContent.trim(),
            likes: 0,
            comments: 0,
            createdAt: Date.now(),
        };

        try {
            await fetch('/api/forum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post),
            });
            setPosts([post, ...posts]);
            setNewTitle('');
            setNewContent('');
            setNewCategory('Crop Management');
            setFormErrors({});
            setShowModal(false);
        } catch (error) {
            console.error('Failed to post discussion:', error);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen bg-muted/5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Community Forum</h1>
                    <p className="text-muted-foreground mt-1">Connect, share, and learn from fellow farmers.</p>
                </div>
                <button type="button" onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" />
                    New Discussion
                </button>
            </div>

            {/* New Discussion Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="new-discussion-title"
                >
                    <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h2 id="new-discussion-title" className="text-xl font-bold">Start a New Discussion</h2>
                            <button type="button" onClick={closeModal} aria-label="Close" title="Close" className="p-1 rounded-full hover:bg-muted transition-colors">
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleNewPost} className="p-5 space-y-4" noValidate>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Title <span className="text-red-500">*</span></label>
                                <input
                                    value={newTitle}
                                    onChange={e => {
                                        setNewTitle(e.target.value);
                                        if (formErrors.title) setFormErrors(prev => ({ ...prev, title: undefined }));
                                    }}
                                    maxLength={150}
                                    className={`w-full p-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm ${formErrors.title ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                    placeholder="What is your question or topic?"
                                />
                                <div className="flex justify-between items-center">
                                    {formErrors.title ? (
                                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {formErrors.title}
                                        </p>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-xs text-muted-foreground">{newTitle.length}/150</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Category <span className="text-red-500">*</span></label>
                                <select title="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                                    {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Description <span className="text-red-500">*</span></label>
                                <textarea
                                    value={newContent}
                                    onChange={e => {
                                        setNewContent(e.target.value);
                                        if (formErrors.content) setFormErrors(prev => ({ ...prev, content: undefined }));
                                    }}
                                    maxLength={2000}
                                    className={`w-full min-h-[120px] p-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none ${formErrors.content ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                    placeholder="Provide details about your question or topic... (minimum 20 characters)"
                                />
                                <div className="flex justify-between items-center">
                                    {formErrors.content ? (
                                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {formErrors.content}
                                        </p>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-xs text-muted-foreground">{newContent.length}/2000</span>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-full border border-border text-sm font-semibold hover:bg-muted transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                                    Post Discussion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    <Filter className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                    <ForumPostCard
                        key={post.id}
                        title={post.title}
                        author={post.author}
                        category={post.category}
                        content={post.content}
                        likes={post.likes}
                        comments={post.comments}
                        timeAgo={getTimeAgo(post.createdAt)}
                        isVerified={post.isVerified}
                    />
                ))}

                {filteredPosts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No discussions found</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Be the first to start a discussion in this category!
                        </p>
                        <button type="button" onClick={() => setShowModal(true)}
                            className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all">
                            <Plus className="h-4 w-4" /> Start Discussion
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
