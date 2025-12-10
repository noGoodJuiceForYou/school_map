&nbsp;## 以下文件是在使用数据库时的配置修改，数据库是本地的，不修改我测试不了，你写的时候按照下面提示改回去就行

\### modified:   back\_end/school-map/.idea/compiler.xml

11行：

```

<entry name="D:/apache-maven-3.9.11/mvn\_repo/org/projectlombok/lombok/1.18.40/lombok-1.18.40.jar" />

```

我的修改：

```

<entry name="$MAVEN\_REPOSITORY$/org/projectlombok/lombok/1.18.40/lombok-1.18.40.jar" />

```



---



&nbsp;### modified:   back\_end/school-map/.idea/dataSources.xml

4行：

```

&nbsp;  <data-source source="LOCAL" name="@localhost" uuid="a52f32ee-5089-4fb5-ae0e-aa8d9c60a48c">

```

我的修改：

```

<data-source source="LOCAL" name="school\_map@localhost" uuid="3025093a-7fbc-4f3c-b870-3870202144d4">

```

8行：

```

<jdbc-url>jdbc:mysql://localhost:3306</jdbc-url>

```

我的修改：

```

<jdbc-url>jdbc:mysql://localhost:3306/school\_map</jdbc-url>

```



---



&nbsp;### modified:   back\_end/school-map/src/main/resources/application.yml

&nbsp;### modified:   back\_end/school-map/target/classes/application.yml

\##### 这两个是数据库root密码，改回去你自己的









