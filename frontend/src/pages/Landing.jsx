import { Link } from 'react-router-dom';
import { Leaf, Scan, BarChart3, Award, ArrowRight, Recycle, TreePine, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const features = [
    {
      icon: <Scan className="w-8 h-8" />,
      title: 'AI Classification',
      description: 'Advanced deep learning model accurately identifies waste categories in seconds'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Smart Analytics',
      description: 'Track your environmental impact with detailed statistics and insights'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Eco Score System',
      description: 'Earn points for proper waste disposal and compete on the leaderboard'
    }
  ];

  const categories = [
    {
      icon: <span className="text-5xl">🥃</span>,
      name: 'Glass',
      color: 'bg-cyan-500',
      description: 'Bottles, jars, containers'
    },
    {
      icon: <AlertTriangle className="w-12 h-12" />,
      name: 'Hazardous',
      color: 'bg-red-500',
      description: 'Batteries, chemicals, electronics'
    },
    {
      icon: <span className="text-5xl">🔧</span>,
      name: 'Metal',
      color: 'bg-gray-600',
      description: 'Cans, foil, metal containers'
    },
    {
      icon: <TreePine className="w-12 h-12" />,
      name: 'Organic',
      color: 'bg-green-500',
      description: 'Food waste, yard waste'
    },
    {
      icon: <span className="text-5xl">📄</span>,
      name: 'Paper',
      color: 'bg-amber-500',
      description: 'Cardboard, newspapers, magazines'
    },
    {
      icon: <Recycle className="w-12 h-12" />,
      name: 'Plastic',
      color: 'bg-blue-500',
      description: 'Bottles, containers, packaging'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-mesh py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="animate-fadeIn"
            >
              <div className="inline-flex items-center bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-glow">
                <Leaf className="w-4 h-4 mr-2" />
                AI-Powered Waste Management
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smart Waste
                <span className="gradient-text"> Classification</span>
                <br />
                Made Simple ♻️
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                AI-powered waste segregation system that helps you dispose waste correctly, 
                track your environmental impact, and earn rewards for sustainable practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center group">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="btn-secondary inline-flex items-center justify-center">
                  Learn More
                </Link>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">10K+</p>
                  <p className="text-sm text-gray-600">Items Classified</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">92%</p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-purple bg-clip-text text-transparent">5K+</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative animate-fadeIn"
            >
              <div className="glass-card p-8 rounded-3xl hover-lift">
                <div className="bg-gradient-rainbow rounded-2xl p-8 text-white text-center relative overflow-hidden">
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 animate-shimmer"></div>
                  
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 inline-block">
                      <Leaf className="w-20 h-20 mx-auto animate-float" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Join the Movement</h3>
                    <p className="text-white/90 mb-6">Making waste management smarter, one scan at a time</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-3xl font-bold">92%</p>
                        <p className="text-sm text-white/80">Accuracy</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-3xl font-bold">5K+</p>
                        <p className="text-sm text-white/80">Users</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-3xl font-bold">24/7</p>
                        <p className="text-sm text-white/80">Available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">SmartWaste</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology meets environmental responsibility
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card group hover:border-primary-400 border-2 border-transparent cursor-pointer"
              >
                <div className="icon-wrapper mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-accent text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              6 Categories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Waste Categories We <span className="gradient-text">Identify</span>
            </h2>
            <p className="text-xl text-gray-600">
              Our AI recognizes six main waste categories with high accuracy
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center hover-lift cursor-pointer group"
              >
                <div className={`${category.color} text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-colored group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {category.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-rainbow relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-600/20 to-accent-600/20 animate-pulse-slow"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🌍 Join 5,000+ Eco Warriors
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of users making smarter waste disposal decisions every day.
              Start your journey towards a cleaner planet today!
            </p>
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-glow-lg hover:scale-105 hover:shadow-glow group"
            >
              Start Classifying Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>Instant Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
