import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowRight, Shield, Clock, CheckCircle, MessageSquare, BarChart3 } from 'lucide-react'
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import studentImg from '@/assets/undraw_futuristic-interface_sv51.svg'
import dpuImg from '@/assets/DYPDPUUnitechsocietylogo1.png';
import studentImg1 from '@/assets/undraw_happy-news_d5bt.svg'
import studentImg2 from '@/assets/raising-hand-animate.svg'
import studentImg3 from '@/assets/lesson-animate.svg'
import studentImg4 from '@/assets/operating-system-upgrade-animate.svg'
import studentImg5 from '@/assets/files-sent-animate.svg'
import studentImg6 from '@/assets/online-review-animate.svg'
import studentImg7 from '@/assets/problem-solving-animate.svg'
import studentImg8 from '@/assets/handsome-indian-man-semi-flat-vector-character-head_151150-15782.jpg'
import studentImg9 from '@/assets/cheerful-hispanic-brunette-man-semi-flat-vector-character-head-male-shirt-editable-cartoon-avatar-icon-face-emotion-colorful-spot-illustration-web-graphic-design-animation_151150-16180.jpg'
import studentImg10 from '@/assets/young-guy-brunette-semi-flat-vector-character-head-man-looks-away-editable-cartoon-avatar-icon-face-emotion-colorful-spot-illustration-web-graphic-design-animation_151150-16182.jpg'


export default function HomePage() {
    const [complaintsResolved, setComplaintsResolved] = useState<number>(0);

    const stats = [
        { label: "Complaints Resolved", value: `${complaintsResolved}+`, accent: "text-black" },
        { label: "Avg Response Time", value: "48h", accent: "text-black" },
        { label: "Satisfaction Rate", value: "95%", accent: "text-black" },
    ];

    const loadResolvedCount = useCallback(async () => {
        // If not authenticated, skip API and use local snapshot
        const token = localStorage.getItem("token");

        // Helper: local fallback
        const loadFromLocal = () => {
            try {
                const savedComplaints = localStorage.getItem("complaints");
                if (!savedComplaints) {
                    setComplaintsResolved(0);
                    return;
                }
                const parsed: any[] = JSON.parse(savedComplaints);
                const resolvedCount = parsed.filter((c) => c.status === "resolved").length;
                setComplaintsResolved(resolvedCount);
            } catch (err) {
                setComplaintsResolved(0);
            }
        };

        if (!token) {
            loadFromLocal();
            return;
        }

        // Try backend first (authorised users)
        try {
            const res = await apiClient.getComplaints({ limit: 1000, status: "resolved" });
            if (res.data?.complaints) {
                const resolvedFromApi = res.data.complaints.length;
                setComplaintsResolved(resolvedFromApi);
                return;
            }
        } catch (err) {
            // Silently fallback (common when token is invalid/expired)
        }

        // Fallback: localStorage
        loadFromLocal();
    }, []);

    useEffect(() => {
        loadResolvedCount();

        // Refresh on interval and when window regains focus
        const intervalId = window.setInterval(loadResolvedCount, 15000);
        const onFocus = () => loadResolvedCount();
        window.addEventListener("focus", onFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", onFocus);
        };
    }, [loadResolvedCount]);

    console.log("API URL:", import.meta.env.VITE_APP_URL);

    // const handleComplaintSubmit = () => {
    //     setComplaintsResolved(prev => prev + 1);
    // };

    return (
        <div className="font-body">
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div>
                                    <img src={dpuImg} width="150" height="50"
                                        alt="logo" className="inline mr-2" />
                                    {/* <!-- <h1 className="text-xl font-bold text-foreground">ComplaintHub</h1> --> */}
                                    <p className="text-sm text-muted-foreground">DYP Deemed University</p>
                                </div>
                            </div>

                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Features
                                </a>
                                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                                    How It Works
                                </a>
                                <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Reviews
                                </a>
                            </nav>
                            <div className="flex items-center space-x-3">
                                <Button variant="outline" asChild>
                                    <Link to="/login">Sign In</Link>
                                </Button>
                                <Button className="bg-accent hover:bg-accent/90" asChild>
                                    <Link to="/signup">Get Started</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" aria-hidden>
                        <div className="absolute -top-24 -right-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
                        <div className="absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
                    </div>
                    <img
                        src={studentImg}
                        alt="Student Illustration"
                        className="hidden md:block absolute left-4 top-24 rounded-lg"
                        width={350}
                        height={150}
                    />

                    {/* Right Side Image at Bottom */}
                    <img
                        src={studentImg1}
                        alt="Faculty Illustration"
                        className="hidden md:block absolute right-0 bottom-4 rounded-lg"
                        width={350}
                        height={150}
                    />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto relative z-10">
                            <div className="flex flex-wrap gap-3 justify-center mb-6">
                                <Badge variant="secondary" className="px-4 py-1">Trusted by students & faculty</Badge>
                                <Badge variant="outline" className="px-4 py-1">Secure • Transparent • Fast</Badge>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
                                Voice Your Concerns,
                                <br />
                                <span className="text-accent">Drive Change</span>
                            </h2>
                            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto text-pretty">
                                A modern, efficient platform designed for your campus community.
                                Submit complaints seamlessly, track progress transparently, and create positive change together.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                                    <Link to="/signup">
                                        Start Your Complaint
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <Link to="/login">Faculty Portal</Link>
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                {stats.map((item) => (
                                    <Card key={item.label} className="border border-slate-200 shadow-sm">
                                        <CardContent className="p-4 text-center">
                                            <div className={`text-2xl font-bold ${item.accent}`}>{item.value}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-bold text-foreground mb-4">
                                Everything You Need
                            </h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                                Comprehensive tools designed for both students and faculty to ensure
                                efficient complaint management and resolution.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Student Features */}
                            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-4 transition-colors flex items-center justify-center">
                                        <img
                                            src={studentImg2}
                                            alt="Student Illustration"
                                            className="object-contain"
                                            height={500}
                                            width={500}
                                        />
                                    </div>
                                    <CardTitle className="text-xl">For Students</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        <li className="flex items-start space-x-3">
                                            <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Submit detailed complaints with attachments</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Track complaint status in real-time</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <FileText className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Edit or withdraw pending complaints</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <MessageSquare className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Receive updates and responses</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Faculty Features */}
                            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-4 transition-colors flex items-center justify-center">
                                        <img
                                            src={studentImg3}
                                            alt="Student Illustration"
                                            className="object-contain"
                                            height={500}
                                            width={500}
                                        />
                                    </div>
                                    <CardTitle className="text-xl">For Faculty</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        <li className="flex items-start space-x-3">
                                            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Secure dashboard with role-based access</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Comprehensive analytics and reporting</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Export detailed PDF reports</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Efficient complaint resolution workflow</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* System Features */}
                            <Card
                                className="group hover:shadow-lg transition-all duration-300 border-0 bg-card md:col-span-2 lg:col-span-1">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-4 transition-colors flex items-center justify-center">
                                        <img
                                            src={studentImg4}
                                            alt="Student Illustration"
                                            className="object-contain"
                                            height={500}
                                            width={500}
                                        />
                                    </div>
                                    <CardTitle className="text-xl">Smart System</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        <li className="flex items-start space-x-3">
                                            <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Auto-generated unique complaint IDs</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <MessageSquare className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Real-time notifications and updates</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <Shield className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Secure data encryption and privacy</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <Clock className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">Mobile-responsive design</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-bold text-foreground mb-4">
                                How It Works
                            </h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Submitting and resolving complaints is simple, secure, and transparent.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="bg-card border-0 shadow-sm">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-4 transition-colors flex items-center justify-center">
                                        <img
                                            src={studentImg5}
                                            alt="Student Illustration"
                                            className="object-contain"
                                            height={500}
                                            width={500}
                                        />
                                    </div>
                                    <CardTitle className="text-lg">Submit</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-muted-foreground text-sm">
                                    Students can easily submit detailed complaints with categories, attachments, and descriptions.
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-0 shadow-sm">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-4 transition-colors flex items-center justify-center">
                                        <img
                                            src={studentImg6}
                                            alt="Student Illustration"
                                            className="object-contain"
                                            height={500}
                                            width={500}
                                        />
                                    </div>
                                    <CardTitle className="text-lg">Review</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-muted-foreground text-sm">
                                    Faculty securely review, categorize, and assign complaints for resolution.
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-0 shadow-sm">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-4 transition-colors flex items-center justify-center">
                                        <img
                                            src={studentImg7}
                                            alt="Student Illustration"
                                            className="object-contain"
                                            height={500}
                                            width={500}
                                        />
                                    </div>
                                    <CardTitle className="text-lg">Resolve</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-muted-foreground text-sm">
                                    Students are notified of progress, and resolved complaints are stored for future reference.
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="testimonials" className="py-20 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-bold text-foreground mb-4">What Students Say</h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                feedback from students and faculty using ComplaintHub daily.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="bg-card border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-sm mb-4">
                                        “Submitting a complaint was super easy, and I could track progress in real time.”
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <img src={studentImg8} alt="Student" width={40} height={40} className="rounded-full" />
                                        <div>
                                            <p className="font-medium text-foreground">Riya Sharma</p>
                                            <p className="text-xs text-muted-foreground">2nd Year, CS</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-sm mb-4">
                                        “Faculty dashboard is intuitive and helps us respond quickly.”
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <img src={studentImg9} alt="Faculty" width={40} height={40} className="rounded-full" />
                                        <div>
                                            <p className="font-medium text-foreground">Prof. Mehta</p>
                                            <p className="text-xs text-muted-foreground">Faculty, Electronics</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-sm mb-4">
                                        “The transparency and notifications really make a difference.”
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <img src={studentImg10} alt="Student" width={40} height={40} className="rounded-full" />
                                        <div>
                                            <p className="font-medium text-foreground">Arjun Patel</p>
                                            <p className="text-xs text-muted-foreground">4th year, Mechanical</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <footer className="bg-card border-t border-border py-8 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            © 2025 ComplaintHub • Made with ❤️ in Pune
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    )
}