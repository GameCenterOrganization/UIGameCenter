const API_BASE_URL = 'http://localhost:3001/api/v1'; 
//const API_BASE_URL = 'http://192.168.50.139:3001/api/v1'; 
class ChatService {
  
  static async sendMessage(message, model = 'llama2') {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: message.trim(),
          model: model 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error del servidor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }


  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', error: error.message };
    }
  }

  
  static async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

export default ChatService;