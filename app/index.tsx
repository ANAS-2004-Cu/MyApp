import { Text, View, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Dimensions, Image } from "react-native";
import { Href, Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function Index() {
  const [projects, setProjects] = useState([
    { id: "1", title: "Guess Game", description: "A number guessing game with hints", to: "/Game1" as Href, icon: "casino" },
    { id: "2", title: "X_O (Normal)", description: "Classic Tic-Tac-Toe game", to: "/Game2" as Href, icon: "grid-on" },
    { id: "3", title: "X_O (3-Marker)", description: "Tic-Tac-Toe with only 3 markers per player", to: "/Game3" as Href, icon: "grid-on" },
    { id: "4", title: "TEMP-MAIL", description: "Create temporary email addresses", to: "/TempMail" as Href, icon: "email" },
  ]);

  // Animation values for statistics
  const [animatedStats, setAnimatedStats] = useState({ projects: 0, completed: 0, rating: 0 });

  useEffect(() => {
    // Simple animation for stats counters
    const timer = setTimeout(() => {
      setAnimatedStats({
        projects: projects.length,
        completed: projects.length,
        rating: 4.8
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const ProjectItem = ({ item }: { item: typeof projects[0] }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(item.to)}
    >
      <View style={styles.projectIconContainer}>
        <MaterialIcons name={item.icon as any} size={36} color="#78F0BC" />
      </View>
      <View style={styles.projectContent}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectDescription}>{item.description}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <MaterialIcons name="arrow-forward-ios" size={18} color="#78F0BC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
      <View style={styles.container}>
        {/* Header with name */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Welcome to</Text>
          <Text style={styles.nameText}>ANAS GAMAL</Text>
          <Text style={styles.subHeaderText}>Gaming Portfolio</Text>
        </View>

        {/* Stats section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{animatedStats.projects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{animatedStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{animatedStats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Project list section */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="game-controller" size={20} color="#78F0BC" /> My Projects
          </Text>
          <FlatList
            data={projects}
            renderItem={({ item }) => <ProjectItem item={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.projectsList}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 Anas Gamal</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  background: {
    width: '100%',
    height: '100%',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  headerText: {
    fontSize: 16,
    color: '#78F0BC',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginVertical: 5,
    textShadowColor: 'rgba(120, 240, 188, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#78F0BC',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 240, 188, 0.3)',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#78F0BC',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
  },
  projectsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    paddingLeft: 5,
  },
  projectsList: {
    paddingBottom: 20,
  },
  projectCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 240, 188, 0.2)',
  },
  projectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  projectContent: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 13,
    color: '#ccc',
  },
  arrowContainer: {
    padding: 5,
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
