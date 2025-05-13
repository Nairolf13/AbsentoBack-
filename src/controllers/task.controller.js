const { notifyTaskUpdate } = require('../utils/socket');


exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByPk(taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    
    const userId = task.userId;
    
    await task.destroy();
    
    notifyTaskUpdate(userId, 'delete', { id: taskId });
    
    return res.status(200).json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

