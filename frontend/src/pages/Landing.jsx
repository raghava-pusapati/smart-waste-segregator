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
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smart Waste
                <span className="text-primary-500"> Classification</span>
                <br />
                Made Simple
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                AI-powered waste segregation system that helps you dispose waste correctly, 
                track your environmental impact, and earn rewards for sustainable practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/about" className="btn-secondary inline-flex items-center justify-center">
                  Learn More
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 rounded-2xl">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl p-8 text-white text-center">
                  <Leaf className="w-20 h-20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Join the Movement</h3>
                  <p className="text-primary-50">Over 10,000+ waste items classified</p>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-3xl font-bold">92%</p>
                      <p className="text-sm text-primary-100">Accuracy</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">5K+</p>
                      <p className="text-sm text-primary-100">Users</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">24/7</p>
                      <p className="text-sm text-primary-100">Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SmartWaste?
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
                className="card group hover:border-primary-500 border-2 border-transparent"
              >
                <div className="text-primary-500 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Waste Categories We Identify
            </h2>
            <p className="text-xl text-gray-600">
              Our AI recognizes four main waste categories
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center hover:shadow-xl"
              >
                <div className={`${category.color} text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-accent-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-50 mb-8">
            Join thousands of users making smarter waste disposal decisions every day
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Start Classifying Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
