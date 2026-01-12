import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Next.js + Tailwind CSS + Shadcn/UI
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Your frontend is ready to go! Here's a showcase of the components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Card</CardTitle>
              <CardDescription>
                This is a Shadcn/UI card component with Tailwind styling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Everything is set up and ready for development. You can start building your application with these pre-configured tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Form</CardTitle>
              <CardDescription>
                Example form using Shadcn/UI components.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Enter your name" />
              </div>
              <Button className="w-full">Submit</Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tech Stack</CardTitle>
              <CardDescription>
                Here's what's included in your setup:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Next.js</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">React Framework</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">TypeScript</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Type Safety</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tailwind CSS</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Utility-First CSS</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Shadcn/UI</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Component Library</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup">
              <Button variant="default">Get Started</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}