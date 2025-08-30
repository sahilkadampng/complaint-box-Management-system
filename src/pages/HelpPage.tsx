import Sidebar from "@/components/Sidebar";
import Breadcrumb from "@/components/Breadcrumb";
import FacultyLayout from "@/components/FacultyLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

import {
    BookOpen,
    Search,
    Mail,
    Phone,
    Settings,
    ShieldCheck,
    AlertCircle,
    Terminal,
} from "lucide-react";

// import { useNavigate } from "react-router-dom";

export default function HelpPage() {
    // const navigate = useNavigate();

    return (
        <FacultyLayout>
            <div className="font-vend flex w-full">
                {/* SIDEBAR */}
                <Sidebar />
                {/* MAIN AREA */}
                <div className="ml-[0rem] mr-[0rem] mt-10 flex-1 h-screen overflow-y-auto bg-background p-2">

                    {/* ===========================
                    TOP NAVBAR (same style as dashboard)
                ============================ */}
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-1 text-black mb-3 mt-10">Help Center</h1>
                            <p className="text-black text-sm md:text-base">Documentation • FAQs • Troubleshooting • System Guide</p>
                        </div>

                        {/* <div className="flex flex-wrap gap-2 md:gap-4 mt-10 mr-4">
                            <Input placeholder="Search complaints, student or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-80 bg-white-100" />
                            <Button variant="secondary" onClick={exportPDF}><Download className="h-4 w-4 mr-0" /> Export Summary</Button>
                        </div> */}
                    </div>

                    {/* ===========================
                    PAGE CONTENT
                ============================ */}
                    <main className="max-w-7xl mx-auto px-2 py-2">
                        <hr className="my-4" />
                        <Breadcrumb current="Help" />

                        {/* Search Bar */}
                        <div className="relative mb-10">
                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search articles or keywords..."
                                className="w-full border bg-white rounded-md py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

                            <Card className="shadow-sm hover:shadow-md transition bg-white rounded-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BookOpen className="h-5 w-5 text-primary" /> User Guide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                    Learn everything about complaint management features.
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm hover:shadow-md transition bg-white rounded-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Settings className="h-5 w-5 text-primary" /> System Workflow
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                    Automatic escalation rules, lifecycle, processing logic.
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm hover:shadow-md transition bg-white rounded-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <ShieldCheck className="h-5 w-5 text-primary" /> Security & Data
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                    How your data is handled and protected inside the system.
                                </CardContent>
                            </Card>

                        </div>

                        {/* Documentation */}
                        <h2 className="text-xl font-semibold mb-4">Documentation</h2>

                        <Accordion type="multiple" className="space-y-3">

                            <AccordionItem value="workflow" className="border rounded-lg px-4 bg-white rounded-md">
                                <AccordionTrigger className="py-4">
                                    Complaint Workflow Explained
                                </AccordionTrigger>
                                <AccordionContent className="pb-5 text-sm text-muted-foreground leading-relaxed">
                                    <ul className="list-disc ml-6 mt-2 space-y-1">
                                        <li>Submitted → logged by the student</li>
                                        <li>In Review → faculty examining</li>
                                        <li>Assigned → passed to authority</li>
                                        <li>Resolved → completed</li>
                                        <li>Escalated → auto after 7 days</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="filters" className="border rounded-lg px-4 bg-white">
                                <AccordionTrigger className="py-4">
                                    Using Filters & Advanced Search
                                </AccordionTrigger>
                                <AccordionContent className="pb-5 text-sm text-muted-foreground leading-relaxed">
                                    <ul className="list-disc ml-6 mt-2 space-y-1">
                                        <li>Search across title, description, student ID</li>
                                        <li>Filter by category or complaint status</li>
                                        <li>Sort results by newest, oldest, or alphabetically</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="reports" className="border rounded-lg px-4 bg-white">
                                <AccordionTrigger className="py-4">
                                    Exporting Reports
                                </AccordionTrigger>
                                <AccordionContent className="pb-5 text-sm text-muted-foreground leading-relaxed">
                                    Export high-quality PDFs with complaint summaries, filters, analytics and timelines.
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>

                        {/* Contact */}
                        <h2 className="text-xl font-semibold mt-14 mb-4">Contact Support</h2>

                        <Card className="shadow-sm bg-white border rounded-md">
                            <CardContent className="py-7 space-y-4">

                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <span className="text-sm">support@dpu.edu.in</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <span className="text-sm">+91 98765 43210</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm">Mon–Sat • 10:00 AM – 6:00 PM</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Terminal className="h-5 w-5 text-primary" />
                                    <span className="text-sm">Technical diagnostics available on request</span>
                                </div>

                            </CardContent>
                        </Card>

                    </main>

                </div>
            </div>
        </FacultyLayout>
    );
}
