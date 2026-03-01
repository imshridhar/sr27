import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
          SR27 Health Emergency Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Connecting travelers to critical healthcare when they need it most
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Our Mission</CardTitle>
            <CardDescription>What drives us</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our mission is to bridge the gap between travelers experiencing medical emergencies and the
              healthcare services they urgently need in unfamiliar locations. We strive to eliminate
              barriers to healthcare access during critical moments by leveraging technology to connect
              users with appropriate medical facilities.
            </p>
            <p>
              We believe that everyone deserves immediate access to quality healthcare, regardless of
              where they are or what language they speak. Our platform is built on the principles of
              accessibility, reliability, and compassion.
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Key Features</CardTitle>
            <CardDescription>How we help in emergencies</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Geolocation-based hospital and clinic finder</span>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Multilingual support for travelers from diverse backgrounds</span>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Blood donor matching for emergencies</span>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Emergency service integration with one-touch calling</span>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Manual location input for areas with limited GPS access</span>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>AI-powered recommendations based on emergency severity</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Our Approach</CardTitle>
          <CardDescription>How we solve the healthcare emergency challenge</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Location Intelligence</h3>
            <p className="text-muted-foreground">
              Our platform uses advanced geolocation technology to identify nearby healthcare facilities,
              ensuring that users can quickly find the help they need in unfamiliar territories.
            </p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Comprehensive Data</h3>
            <p className="text-muted-foreground">
              We maintain detailed information about medical facilities, including specialties, doctor availability,
              and emergency services, helping users make informed decisions during critical moments.
            </p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Language Barriers Eliminated</h3>
            <p className="text-muted-foreground">
              With support for multiple languages, our platform ensures that language barriers don't
              stand in the way of receiving urgent medical care, especially for international travelers.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to experience healthcare without barriers?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Join thousands of travelers who rely on SR27 Health Emergency Services for peace of mind during their journeys.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Button>
          </Link>
          <Link href="/hospitals">
            <Button size="lg" variant="outline" className="gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Find Hospitals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}