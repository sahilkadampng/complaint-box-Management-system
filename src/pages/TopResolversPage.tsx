import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Award, User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

interface ResolverStat {
    facultyId: string;
    name: string;
    email: string;
    resolvedCount: number;
}

const TopResolversPage: React.FC = () => {
    const { addNotification } = useNotification();
    const [resolvers, setResolvers] = useState<ResolverStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all resolved complaints and faculty users in parallel
                const [complaintsRes, usersRes] = await Promise.all([
                    apiClient.getComplaints({ status: 'resolved', limit: 50 }),
                    apiClient.getUsers({ role: 'faculty', limit: 50 }),
                ]);

                if (complaintsRes.error) {
                    addNotification?.({ type: 'error', message: complaintsRes.error });
                    setLoading(false);
                    return;
                }

                const complaints = complaintsRes.data?.complaints || [];
                const facultyUsers = usersRes.data?.users || [];

                // Build a lookup map of faculty by name and by id
                const facultyByName: Record<string, { id: string; name: string; email: string }> = {};
                const facultyById: Record<string, { id: string; name: string; email: string }> = {};
                for (const f of facultyUsers) {
                    const id = f._id || f.id;
                    const entry = { id, name: f.name || 'Unknown', email: f.email || '' };
                    if (f.name) facultyByName[f.name] = entry;
                    if (id) facultyById[id] = entry;
                }

                // Count who resolved each complaint using history entries
                const countMap: Record<string, { name: string; email: string; count: number }> = {};

                for (const c of complaints) {
                    // Find the history entry where status became 'resolved'
                    const history = Array.isArray(c.history) ? c.history : [];
                    const resolvedEntry = [...history].reverse().find(
                        (h: any) => h.status === 'resolved' && h.updatedBy
                    );

                    let resolverName = resolvedEntry?.updatedBy || '';
                    let resolverEmail = '';
                    let resolverId = '';

                    // Try to match via history updatedBy name
                    if (resolverName && facultyByName[resolverName]) {
                        const match = facultyByName[resolverName];
                        resolverId = match.id;
                        resolverEmail = match.email;
                    }
                    // Fallback: use assignedTo field
                    else if (c.assignedTo) {
                        const assignedId = typeof c.assignedTo === 'object'
                            ? (c.assignedTo._id || c.assignedTo.id)
                            : c.assignedTo;
                        if (assignedId && facultyById[assignedId]) {
                            const match = facultyById[assignedId];
                            resolverId = match.id;
                            resolverName = match.name;
                            resolverEmail = match.email;
                        } else if (assignedId) {
                            resolverId = assignedId;
                            resolverName = resolverName || 'Unknown Faculty';
                        }
                    }

                    if (!resolverId && !resolverName) continue;
                    const key = resolverId || resolverName;

                    if (!countMap[key]) {
                        countMap[key] = { name: resolverName, email: resolverEmail, count: 0 };
                    }
                    countMap[key].count += 1;
                }

                const sorted = Object.entries(countMap)
                    .map(([facultyId, data]) => ({
                        facultyId,
                        name: data.name,
                        email: data.email,
                        resolvedCount: data.count,
                    }))
                    .sort((a, b) => b.resolvedCount - a.resolvedCount);

                setResolvers(sorted);
            } catch (error) {
                console.error('Error fetching top resolvers:', error);
                addNotification?.({ type: 'error', message: 'Failed to load top resolvers' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
        if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
        return <User className="h-5 w-5 text-gray-400" />;
    };

    const getRankBg = (index: number) => {
        if (index === 0) return 'bg-gray-50 border-gray-200';
        if (index === 1) return 'bg-gray-50 border-gray-200';
        if (index === 2) return 'bg-gray-50 border-gray-200';
        return 'bg-white border-gray-100';
    };

    return (
        <div className="p-6 max-w-3xl mx-auto mt-[4rem]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    Top Resolvers
                </h1>
                <p className="text-muted-foreground mt-2">
                    Faculty members ranked by number of resolved complaints.
                </p>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {/* Skeleton stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-md border bg-white p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-200" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-5 w-12 bg-gray-200 rounded" />
                                    <div className="h-3 w-20 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Skeleton rows */}
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="rounded-md border bg-white p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-36 bg-gray-200 rounded" />
                                <div className="h-3 w-48 bg-gray-100 rounded" />
                                <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="h-6 w-8 bg-gray-200 rounded ml-auto" />
                                <div className="h-3 w-14 bg-gray-100 rounded ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : resolvers.length === 0 ? (
                <Card className="shadow-card rounded-md">
                    <CardContent className="py-12 text-center">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No resolved complaints yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {resolvers.map((resolver, index) => (
                        <Card
                            key={resolver.facultyId}
                            className={`shadow-card rounded-md border ${getRankBg(index)}`}
                        >
                            <CardContent className="flex items-center gap-4 py-4">
                                {/* Rank */}
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-sm border">
                                    {index < 3 ? (
                                        getRankIcon(index)
                                    ) : (
                                        <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{resolver.name}</p>
                                    {resolver.email && (
                                        <p className="text-sm text-muted-foreground truncate">{resolver.email}</p>
                                    )}
                                </div>

                                {/* Count */}
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">{resolver.resolvedCount}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {resolver.resolvedCount === 1 ? 'complaint' : 'complaints'} resolved
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopResolversPage;
