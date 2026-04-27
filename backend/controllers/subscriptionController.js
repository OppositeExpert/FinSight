const Subscription = require('../models/Subscription');

// @desc    Get all subscriptions for user
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new subscription
// @route   POST /api/subscriptions
// @access  Private
const addSubscription = async (req, res) => {
  try {
    const { name, amount, dueDate, cycle, category } = req.body;

    const subscription = await Subscription.create({
      user: req.user._id,
      name,
      amount,
      dueDate,
      cycle: cycle || 'monthly',
      category: category || 'Bills',
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Add subscription error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('Update subscription error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscription removed', id: req.params.id });
  } catch (error) {
    console.error('Delete subscription error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSubscriptions, addSubscription, updateSubscription, deleteSubscription };
