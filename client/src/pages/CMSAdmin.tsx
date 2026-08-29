import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';

export default function CMSAdmin() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be an admin to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Load CMS data
  const { data: teamMembers = [] } = trpc.cms.listTeamMembers.useQuery();
  const { data: cities = [] } = trpc.cms.listCities.useQuery();
  const { data: experiences = [] } = trpc.cms.listExperiences.useQuery({});
  const { data: itineraries = [] } = trpc.cms.listItineraries.useQuery();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CMS Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all Wellcometochina content</p>
        </div>

        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="experiences">Experiences</TabsTrigger>
            <TabsTrigger value="itineraries">Itineraries</TabsTrigger>
          </TabsList>

          {/* Team Members */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage team members ({teamMembers.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cities */}
          <TabsContent value="cities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cities</CardTitle>
                <CardDescription>Manage destinations ({cities.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cities.map((city) => (
                    <div key={city.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-semibold">{city.name}</p>
                        <p className="text-sm text-muted-foreground">{city.slug}</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiences */}
          <TabsContent value="experiences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Experiences</CardTitle>
                <CardDescription>Manage experiences ({experiences.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-semibold">{exp.name}</p>
                        <p className="text-sm text-muted-foreground">{exp.slug}</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Itineraries */}
          <TabsContent value="itineraries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Itineraries</CardTitle>
                <CardDescription>Manage travel itineraries ({itineraries.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {itineraries.map((itin) => (
                    <div key={itin.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-semibold">{itin.name}</p>
                        <p className="text-sm text-muted-foreground">{itin.days} days • {itin.price}</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
