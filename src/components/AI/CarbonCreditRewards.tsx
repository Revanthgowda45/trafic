import React from 'react';
import { Leaf, Award, TrendingUp, Users, Coins, Trophy, Target } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const CarbonCreditRewards: React.FC = () => {
  const { carbonCredits } = useAIStore();
  const userCredit = carbonCredits[0]; // Using first user for demo

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return '🏆';
    if (rank <= 10) return '🥇';
    if (rank <= 50) return '🥈';
    if (rank <= 100) return '🥉';
    return '🏅';
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-yellow-600 bg-yellow-50';
    if (rank <= 10) return 'text-orange-600 bg-orange-50';
    if (rank <= 50) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Carbon Credit Traffic Rewards</h3>
            <p className="text-sm text-gray-600">Blockchain-based eco-friendly driving incentives</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <Coins className="w-4 h-4" />
          <span className="text-sm font-medium">Blockchain Active</span>
        </div>
      </div>

      {/* User Stats */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              U
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Your Carbon Impact</h4>
              <p className="text-sm text-gray-600">Eco-friendly driver since Jan 2025</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRankColor(userCredit.rank)}`}>
            {getRankBadge(userCredit.rank)} Rank #{userCredit.rank}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Coins className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Credits Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{userCredit.credits}</p>
            <p className="text-xs text-gray-600">₹{(userCredit.credits * 0.5).toFixed(0)} tax benefit</p>
          </div>

          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Routes Followed</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{userCredit.routesFollowed}</p>
            <p className="text-xs text-gray-600">AI recommendations</p>
          </div>

          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">CO₂ Saved</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{userCredit.co2Saved}</p>
            <p className="text-xs text-gray-600">kg this month</p>
          </div>

          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">Community</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{userCredit.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-600">total participants</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">🏆 District Leaderboard</h4>
          <div className="space-y-3">
            {[
              { name: 'Rajesh Kumar', credits: 2450, co2: 245.0, rank: 1 },
              { name: 'Priya Sharma', credits: 2180, co2: 218.0, rank: 2 },
              { name: 'Amit Patel', credits: 1920, co2: 192.0, rank: 3 },
              { name: 'You', credits: userCredit.credits, co2: userCredit.co2Saved, rank: userCredit.rank },
              { name: 'Sneha Reddy', credits: 1150, co2: 115.0, rank: 5 }
            ].map((user, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                user.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getRankBadge(user.rank)}</span>
                  <div>
                    <p className={`font-medium ${user.name === 'You' ? 'text-blue-900' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600">{user.co2} kg CO₂ saved</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{user.credits}</p>
                  <p className="text-xs text-gray-500">credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">💰 Reward System</h4>
          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h5 className="font-medium text-green-900 mb-2">How to Earn Credits</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Follow AI route suggestions: +10 credits</li>
                <li>• Avoid congested areas: +5 credits</li>
                <li>• Use off-peak hours: +15 credits</li>
                <li>• Carpool detected: +25 credits</li>
                <li>• Electric vehicle bonus: +50 credits</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">Redeem Benefits</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Tax benefits: ₹0.50 per credit</li>
                <li>• Public transport discounts</li>
                <li>• Fuel vouchers</li>
                <li>• EV charging credits</li>
                <li>• Government recognition</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Integration */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-2 mb-3">
          <Coins className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-gray-900">Blockchain Integration</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3">
            <h6 className="font-medium text-gray-900 mb-1">🔗 Secure Storage</h6>
            <p className="text-sm text-gray-600">Credits stored on government blockchain</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <h6 className="font-medium text-gray-900 mb-1">🔒 Transparent</h6>
            <p className="text-sm text-gray-600">Immutable transaction history</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <h6 className="font-medium text-gray-900 mb-1">💳 Redeemable</h6>
            <p className="text-sm text-gray-600">Direct tax benefit integration</p>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total CO₂ Saved</p>
              <p className="text-2xl font-bold text-green-700">1,247</p>
            </div>
            <Leaf className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">tons this month</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">System Adoption</p>
              <p className="text-2xl font-bold text-blue-700">40%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">route compliance</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Credits Issued</p>
              <p className="text-2xl font-bold text-purple-700">2.4M</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">total credits</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Tax Benefits</p>
              <p className="text-2xl font-bold text-orange-700">₹1.2M</p>
            </div>
            <Trophy className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">distributed</p>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Leaf className="w-5 h-5 text-green-600" />
          <span className="font-medium text-gray-900">World's First Carbon Credit Traffic System</span>
        </div>
        <p className="text-sm text-gray-700">
          Revolutionary blockchain-based system where citizens earn carbon credits for using optimized routes. 
          Credits stored on government blockchain and redeemable for tax benefits. Gamified leaderboards for 
          most eco-friendly drivers increase system effectiveness by 40% through citizen incentivization.
        </p>
      </div>
    </div>
  );
};

export default CarbonCreditRewards;
