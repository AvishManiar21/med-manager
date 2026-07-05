import React from 'react';
import {
  Calendar,
  Users,
  FileText,
  Package,
  BarChart3,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onGetStarted: () => void;
  darkMode: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, darkMode }) => {
  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Complete patient lifecycle tracking with medical history, allergies, and structured health records.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Drag-and-drop calendar with appointment reminders, cancellation tracking, and status management.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Multi-medicine prescriptions with dosage tracking, expiration warnings, and email delivery.",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: DollarSign,
      title: "Billing & Payments",
      description: "Automated invoicing, installment plans, payment tracking, and financial reporting.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Package,
      title: "Inventory Control",
      description: "Real-time stock monitoring, low-stock alerts, expiration tracking, and restock management.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Revenue insights, service mix charts, patient flow analysis, and exportable reports.",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  const stats = [
    { value: "100%", label: "Real-time Sync" },
    { value: "0ms", label: "Latency" },
    { value: "8+", label: "Core Modules" },
    { value: "∞", label: "Scalability" }
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    )}>
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors duration-300",
        darkMode
          ? "bg-slate-950/80 border-white/10"
          : "bg-white/80 border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">DF</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DentalFlow Pro
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className={cn(
                "px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2",
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
              )}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute top-1/4 -left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20",
            "bg-gradient-to-br from-blue-500 to-purple-600"
          )} />
          <div className={cn(
            "absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20",
            "bg-gradient-to-br from-purple-500 to-pink-600"
          )} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Modern Practice Management
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="block">Dental Practice</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simplified & Streamlined
            </span>
          </h1>

          <p className={cn(
            "text-xl sm:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed",
            darkMode ? "text-slate-300" : "text-slate-600"
          )}>
            All-in-one practice management platform with real-time patient tracking,
            smart scheduling, digital prescriptions, and powerful analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 transition-all duration-200 flex items-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className={cn(
                "px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 border-2",
                darkMode
                  ? "border-white/20 hover:border-white/40 hover:bg-white/5"
                  : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              )}
            >
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className={cn(
                "p-6 rounded-2xl border backdrop-blur-sm",
                darkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-slate-50 border-slate-200"
              )}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className={cn(
                  "text-sm font-medium",
                  darkMode ? "text-slate-400" : "text-slate-600"
                )}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Powerful Features
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Everything you need to run
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                a modern dental practice
              </span>
            </h2>
            <p className={cn(
              "text-lg max-w-2xl mx-auto",
              darkMode ? "text-slate-300" : "text-slate-600"
            )}>
              Built with React 19, TypeScript, and Firebase for real-time performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={cn(
                  "group p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl",
                  darkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white border-slate-200 hover:shadow-slate-200"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl bg-gradient-to-br mb-6 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
                  feature.gradient
                )}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className={cn(
                  "leading-relaxed",
                  darkMode ? "text-slate-400" : "text-slate-600"
                )}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={cn(
        "py-20 px-4 sm:px-6 lg:px-8 border-y",
        darkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Secure & Reliable
                </span>
              </div>
              <h2 className="text-4xl font-extrabold mb-6">
                Built for dental professionals who value
                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  efficiency and precision
                </span>
              </h2>
              <p className={cn(
                "text-lg mb-8",
                darkMode ? "text-slate-300" : "text-slate-600"
              )}>
                DentalFlow Pro combines modern design with powerful functionality to help
                you manage your practice efficiently and focus on what matters most — your patients.
              </p>

              <div className="space-y-4">
                {[
                  "Real-time synchronization across all devices",
                  "Automated backups and data security",
                  "Intuitive interface with minimal learning curve",
                  "Mobile-responsive for on-the-go access",
                  "Comprehensive reporting and analytics"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className={cn(
                      "text-base",
                      darkMode ? "text-slate-300" : "text-slate-700"
                    )}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn(
              "rounded-3xl p-8 border backdrop-blur-sm",
              darkMode
                ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10"
                : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
            )}>
              <div className="space-y-6">
                <div className={cn(
                  "p-6 rounded-2xl border",
                  darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}>
                  <Clock className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Save Time</h3>
                  <p className={cn(
                    "text-sm",
                    darkMode ? "text-slate-400" : "text-slate-600"
                  )}>
                    Automate routine tasks and reduce administrative overhead by up to 70%
                  </p>
                </div>
                <div className={cn(
                  "p-6 rounded-2xl border",
                  darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}>
                  <Shield className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Stay Secure</h3>
                  <p className={cn(
                    "text-sm",
                    darkMode ? "text-slate-400" : "text-slate-600"
                  )}>
                    Enterprise-grade security with Firebase authentication and encrypted data storage
                  </p>
                </div>
                <div className={cn(
                  "p-6 rounded-2xl border",
                  darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}>
                  <BarChart3 className="w-8 h-8 text-purple-500 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Make Decisions</h3>
                  <p className={cn(
                    "text-sm",
                    darkMode ? "text-slate-400" : "text-slate-600"
                  )}>
                    Data-driven insights to optimize your practice and increase profitability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Ready to transform your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              dental practice?
            </span>
          </h2>
          <p className={cn(
            "text-xl mb-12",
            darkMode ? "text-slate-300" : "text-slate-600"
          )}>
            Join modern dental practices using DentalFlow Pro to streamline operations
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-xl shadow-2xl shadow-blue-500/50 transition-all duration-200 flex items-center gap-3 mx-auto group"
          >
            Get Started Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn(
        "border-t py-12 px-4 sm:px-6 lg:px-8",
        darkMode ? "bg-slate-900/50 border-white/10" : "bg-slate-50 border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">DF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DentalFlow Pro
            </span>
          </div>
          <p className={cn(
            "text-sm mb-4",
            darkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Professional Dental Care & Practice Management
          </p>
          <p className={cn(
            "text-xs",
            darkMode ? "text-slate-500" : "text-slate-500"
          )}>
            © 2026 DentalFlow Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
