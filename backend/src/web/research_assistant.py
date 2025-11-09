import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ResearchAssistant:
    def __init__(self):
        self.search_engine = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize research assistant"""
        try:
            from .search_engine import SearchEngine
            self.search_engine = SearchEngine()
            await self.search_engine.initialize()
            
            self.is_initialized = True
            logger.info("✅ Research Assistant initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize Research Assistant: {e}")
            return False
    
    async def research_topic(self, topic: str, depth: str = "basic") -> Dict[str, Any]:
        """Research a topic comprehensively"""
        if not self.is_initialized:
            return {'success': False, 'error': 'Research assistant not initialized'}
        
        try:
            # Perform multiple searches for comprehensive research
            searches = [
                f"what is {topic}",
                f"{topic} overview",
                f"latest developments in {topic}",
                f"{topic} applications"
            ]
            
            all_results = []
            for search_query in searches:
                result = await self.search_engine.search_web(search_query, max_results=3)
                if result['success']:
                    all_results.extend(result['results'])
            
            # Generate research summary
            summary = await self._generate_research_summary(topic, all_results)
            
            return {
                'success': True,
                'topic': topic,
                'summary': summary,
                'sources': all_results,
                'total_sources': len(all_results)
            }
            
        except Exception as e:
            logger.error(f"Error researching topic {topic}: {e}")
            return {'success': False, 'error': str(e)}
    
    async def _generate_research_summary(self, topic: str, sources: List[Dict[str, Any]]) -> str:
        """Generate research summary from sources"""
        # This would use AI to synthesize information from multiple sources
        summary = f"Research Summary for: {topic}\n\n"
        summary += f"Based on analysis of {len(sources)} sources, here's what I found:\n\n"
        
        # Extract key information from sources (simplified)
        key_points = set()
        for source in sources[:5]:  # Use first 5 sources
            snippet = source.get('snippet', '')
            # Extract potential key points (simplified)
            if len(snippet) > 50:
                key_points.add(snippet[:100] + "...")
        
        for i, point in enumerate(list(key_points)[:5], 1):
            summary += f"{i}. {point}\n"
        
        summary += f"\nThis summary is based on automated research. For comprehensive understanding, consult the original sources."
        
        return summary
    
    async def compare_topics(self, topics: List[str]) -> Dict[str, Any]:
        """Compare multiple topics"""
        try:
            comparisons = {}
            
            for topic in topics:
                research = await self.research_topic(topic, depth="basic")
                if research['success']:
                    comparisons[topic] = {
                        'summary': research['summary'],
                        'sources_count': research['total_sources']
                    }
            
            return {
                'success': True,
                'topics': topics,
                'comparisons': comparisons
            }
            
        except Exception as e:
            logger.error(f"Error comparing topics: {e}")
            return {'success': False, 'error': str(e)}
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.search_engine:
            await self.search_engine.cleanup()
        self.is_initialized = False
