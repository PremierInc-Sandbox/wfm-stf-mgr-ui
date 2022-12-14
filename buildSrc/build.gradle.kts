plugins {
  // Apply the Java Gradle plugin development plugin to add support for developing Gradle plugins
  `java-gradle-plugin`

  // Apply the Kotlin JVM plugin to add support for Kotlin.
  id("org.jetbrains.kotlin.jvm") version "1.5.31"
  `kotlin-dsl`
}

repositories {
  maven(url = "https://code.premierinc.com/artifacts/content/groups/public")
  maven(url = "https://code.premierinc.com/artifacts/content/groups/releases-group")
}

dependencies {
  implementation(platform("org.jetbrains.kotlin:kotlin-bom"))
  implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
  implementation("com.google.guava:guava:31.0.1-jre")

  implementation("com.github.node-gradle:gradle-node-plugin:3.2.1")
  implementation("org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:3.3")

  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
}

java {
  toolchain {
    languageVersion.set(JavaLanguageVersion.of("11"))
  }
}

gradlePlugin {
  plugins {
    create("nodePlugin") {
      id = "premierinc.wfm.stfmgr.node"
      implementationClass = "premierinc.wfm.node.NodePlugin"
    }
  }
}
