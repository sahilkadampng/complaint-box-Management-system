import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileDown, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import FacultyLayout from "@/components/FacultyLayout";

interface User {
    name: string;
    username: string;
    role: "student" | "faculty";
    email?: string;
    password?: string;
    createdAt?: string;
    createdBy?: string;
    department?: string;
    yearOfStudy?: string;
}

interface Faculty extends User {
    createdByName?: string;
}

const ViewFacultyPage: React.FC = () => {
    const navigate = useNavigate();
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");

        // Filter all faculty users
        const faculties = allUsers.filter(u => u.role === "faculty");

        // Map createdBy username to full name
        const facultiesWithCreator: Faculty[] = faculties.map(f => {
            const creator = allUsers.find(u => u.username === f.createdBy);
            return {
                ...f,
                createdByName: creator ? creator.name : "Unknown",
            };
        });

        setFacultyList(facultiesWithCreator);
    }, []);

    const filteredFaculty = facultyList.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.createdByName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownloadPDF = useCallback(() => {
        if (!filteredFaculty.length) return;

        const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
        const now = new Date();

        doc.setProperties({
            title: "Faculty List",
            subject: "Exported faculty members",
            creator: "Your App",
        });

        doc.setFontSize(16);
        doc.text("Faculty List", 30, 30);
        doc.setFontSize(10);
        doc.text(`Generated: ${now.toLocaleString()}`, 30, 48);

        const rows = filteredFaculty.map((f, index) => [
            index + 1,
            f.name,
            f.username,
            f.email ?? "-",
            f.department ?? "-",
            f.yearOfStudy ?? "-",
            f.createdByName ?? "-",
            f.createdAt ?? "-",
        ]);

        autoTable(doc, {
            head: [["#", "Name", "Username", "Email", "Department", "Year", "Added By", "Added On"]],
            body: rows,
            startY: 74,
            margin: { top: 60, bottom: 40, left: 30, right: 40 },
            styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
            headStyles: { fillColor: [33, 150, 243], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { cellWidth: 30, halign: "right" },
                1: { cellWidth: 120 },
                2: { cellWidth: 65},
                3: { cellWidth: 180 },
                4: { cellWidth: 110 },
                5: { cellWidth: 60 },
                6: { cellWidth: 120 },
                7: { cellWidth: 140 },
            },
            didDrawPage: (data) => {
                const pageCount = doc.getNumberOfPages();
                const pageWidth = (doc.internal.pageSize as any).getWidth();
                const pageHeight = (doc.internal.pageSize as any).getHeight();
                doc.setFontSize(9);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 40, pageHeight - 20, { align: "right" });
            },
        });

        const filename = `faculty-list_${now.toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);
    }, [filteredFaculty]);

    return (
        <FacultyLayout>
            <div className="max-w-6xl mx-auto px-6 py-10 mt-20 rounded-sm">
                {/* Header */}
                <Card className="mb-8 shadow-sm rounded-md">
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Users className="h-6 w-6 text-black" />
                                Faculty Members
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">
                                Here’s the list of all faculty members.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-end mt-4 md:mt-0">
                            <Input
                                placeholder="Search faculty..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-64 md:w-64 w-full"
                            />
                            <Button
                                onClick={handleDownloadPDF}
                                className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                            >
                                <FileDown className="h-4 w-4 mr-2" /> Export PDF
                            </Button>
                            <Button
                                className="bg-gray-100 hover:bg-gray-200 text-black shadow-sm w-full md:w-auto"
                                onClick={() => navigate("/register")}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Faculty Table */}
                <Card className="shadow-sm rounded-md">
                    <CardContent>
                        {filteredFaculty.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Added By</TableHead>
                                            <TableHead>Added On</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFaculty.map((f, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{f.name}</TableCell>
                                                <TableCell>{f.username}</TableCell>
                                                <TableCell>{f.email}</TableCell>
                                                <TableCell>{f.department || "-"}</TableCell>
                                                <TableCell>{f.yearOfStudy || "-"}</TableCell>
                                                <TableCell>{f.createdByName}</TableCell>
                                                <TableCell>{f.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No faculty members found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </FacultyLayout>
    );
};

export default ViewFacultyPage;
