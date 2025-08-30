import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, FileText, ArrowRight } from 'lucide-react';

const Index = () => {
    return (
        <div className="min-h-screen bg-gradient-secondary">
            {/* Header */}
            <header className="bg-card shadow-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Left Section (Logo + Text) */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-primary">
                                <img
                                    src="https://acs.dypdpuerp.in/assets/images/DYPDPUUnitechsocietylogo1.png"
                                    width="150"
                                    height="50"
                                    alt="logo"
                                    className="inline mr-2"
                                />
                            </h1>
                            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                                Streamlined complaint management for students and faculty
                            </p>
                        </div>

                        {/* Right Section (Buttons) */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Link to="/login" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Sign In
                                </Button>
                            </Link>
                            {/* <Link to="/signup" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto bg-sky-600 hover:shadow-hover transition-all duration-200 bg-sky-500">
                                    Get Started
                                </Button>
                            </Link> */}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl font-bold text-foreground mb-6">
                        Voice Your Concerns,
                        <br />
                        <span className="text-primary">Drive Change</span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        A modern, efficient platform for students to submit complaints and faculty to manage them.
                        Transparent, accountable, and designed for your campus community.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/signup" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-sky-500 hover:shadow-hover transition-all duration-200"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                Faculty Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-foreground mb-4">
                            How It Works
                        </h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Simple, secure, and effective complaint management for everyone on campus.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Student Features */}
                        <Card className="shadow-hover hover:shadow-card transition-all duration-300 group">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                                    <GraduationCap className="h-12 w-12 text-primary" />
                                </div>
                                <CardTitle className="text-xl">For Students</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span>Submit detailed complaints easily</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span>Track complaint status in real-time</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span>Edit or delete pending complaints</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span>Categorize by type (Exam, Hostel, etc.)</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Faculty Features */}
                        <Card className="shadow-hover hover:shadow-card transition-all duration-300 group">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition-colors">
                                    <Users className="h-12 w-12 text-secondary" />
                                </div>
                                <CardTitle className="text-xl">For Faculty</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-secondary" />
                                        <span>View all student complaints</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-secondary" />
                                        <span>Update complaint status</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-secondary" />
                                        <span>Export detailed PDF reports</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-secondary" />
                                        <span>Search and filter complaints</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* System Features */}
                        <Card className="shadow-hover hover:shadow-card transition-all duration-300 group md:col-span-2 lg:col-span-1">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                                    <FileText className="h-12 w-12 text-accent" />
                                </div>
                                <CardTitle className="text-xl">Smart Features</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-accent" />
                                        <span>Auto-generated complaint IDs</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-accent" />
                                        <span>Real-time notifications</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-accent" />
                                        <span>Dark mode support</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-accent" />
                                        <span>Mobile-responsive design</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* <section className="py-20 bg-card">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-3xl font-bold text-foreground mb-4">
                        Ready to Get Started?
                    </h3>
                    <p className="text-muted-foreground mb-8">
                        Join the modern way of handling campus complaints. Transparent, efficient, and effective.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/signup">
                            <Button size="lg" className="bg-sky-500 hover:shadow-hover transition-all duration-200">
                                Create Account
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section> */}

            {/* Footer */}
            <footer className="bg-muted py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-muted-foreground">
                            © 2025 MADE WITH <img src='https://cdn-icons-png.flaticon.com/128/2589/2589175.png' width="25px" height="25px" alt='logo' className='inline mr-2' />IN PUNE.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;
