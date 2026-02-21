import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Preview = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="flex h-12 items-center justify-between bg-foreground px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to={`/builder/${id}`}><ArrowLeft className="mr-1 h-4 w-4" /> Back to Builder</Link>
          </Button>
        </div>
        <span className="text-sm font-medium text-primary-foreground">Preview Mode — This is not your live site</span>
        <div />
      </div>

      {/* Rendered website mock */}
      <div className="mx-auto max-w-5xl">
        {/* Mock Header */}
        <header className="flex items-center justify-between border-b px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-lg font-bold text-foreground">Acme Corp</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <span className="text-sm text-muted-foreground">Home</span>
            <span className="text-sm text-muted-foreground">About</span>
            <span className="text-sm text-muted-foreground">Contact</span>
          </nav>
        </header>

        {/* Mock Hero */}
        <section className="py-20 px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">Welcome to Acme Corp</h1>
          <p className="mt-4 text-lg text-muted-foreground">Building the future, one step at a time.</p>
          <Button className="mt-8" size="lg">Get Started</Button>
        </section>

        {/* Mock About */}
        <section className="border-t px-8 py-16">
          <h2 className="text-2xl font-bold text-foreground">About Us</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            We are a company dedicated to innovation and excellence. Our team of experts works tirelessly to deliver the best solutions for our clients.
          </p>
        </section>

        {/* Mock CTA */}
        <section className="border-t bg-muted px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground">Get Started Today</h2>
          <p className="mt-2 text-muted-foreground">Join thousands of businesses already using our platform.</p>
          <Button className="mt-6">Sign Up</Button>
        </section>

        {/* Mock Footer */}
        <footer className="border-t px-8 py-8 text-center text-sm text-muted-foreground">
          © 2026 Acme Corp. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Preview;
